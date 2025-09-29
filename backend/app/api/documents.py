from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
import aiofiles
import logging
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Document, Summary, Keyword, ProcessingJob
from app.schemas.schemas import (
    Document as DocumentSchema,
    DocumentWithContent,
    UploadResponse,
    AnalysisResult,
    DocumentAnalysis,
    ErrorResponse
)
from app.api.deps import get_current_active_user
from app.services.pdf_processor import pdf_processor
from app.services.nlp_service import nlp_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a PDF document for processing."""
    try:
        # Validate file
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed"
            )
        
        if not file.size or file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size must be less than {settings.MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = Path(settings.UPLOAD_DIR) / unique_filename
        
        # Save file to disk
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create document record
        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=str(file_path),
            file_size=file.size,
            mime_type=file.content_type or "application/pdf",
            processing_status="uploaded",
            owner_id=current_user.id
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        logger.info(f"Document uploaded: {file.filename} by user {current_user.username}")
        
        return UploadResponse(
            success=True,
            document_id=document.id,
            filename=file.filename,
            message="File uploaded successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File upload failed"
        )

@router.post("/{document_id}/process", response_model=AnalysisResult)
async def process_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Process uploaded document (extract text, summarize, extract keywords)."""
    try:
        # Get document
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Update status
        document.processing_status = "processing"
        db.commit()
        
        # Process PDF
        pdf_result = pdf_processor.process_pdf(Path(document.file_path))
        
        if not pdf_result['success']:
            document.processing_status = "failed"
            document.processing_error = pdf_result['error']
            db.commit()
            
            return AnalysisResult(
                document_id=document_id,
                processing_status="failed",
                error_message=pdf_result['error']
            )
        
        # Update document with extracted content
        document.extracted_text = pdf_result['text']
        document.word_count = pdf_result.get('word_count', 0)
        document.char_count = pdf_result.get('char_count', 0)
        
        # Update metadata
        metadata = pdf_result.get('metadata', {})
        document.pdf_title = metadata.get('title', '')
        document.pdf_author = metadata.get('author', '')
        document.pdf_subject = metadata.get('subject', '')
        document.page_count = metadata.get('page_count', 0)
        
        # Generate summary
        summary_result = await nlp_service.summarize_text(pdf_result['text'])
        if summary_result.get('summary'):
            summary = Summary(
                document_id=document.id,
                summary_text=summary_result['summary'],
                bullet_points=json.dumps(summary_result.get('bullet_points', [])),
                summary_type="auto"
            )
            db.add(summary)
        
        # Extract keywords
        keywords_result = await nlp_service.extract_keywords(pdf_result['text'])
        for keyword_obj in keywords_result:
            keyword = Keyword(
                document_id=document.id,
                keyword=keyword_obj['keyword'],
                score=keyword_obj.get('score'),
                extraction_method=keyword_obj['method']
            )
            db.add(keyword)
        
        # Update processing status
        document.processing_status = "completed"
        document.processed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(document)
        
        # Prepare response
        summary_obj = db.query(Summary).filter(Summary.document_id == document_id).first()
        keywords_list = db.query(Keyword).filter(Keyword.document_id == document_id).all()
        
        # Convert summary_obj to dict and parse bullet_points
        if summary_obj:
            # Parse bullet_points from JSON string to list
            try:
                bullet_points = json.loads(summary_obj.bullet_points) if summary_obj.bullet_points else []
            except (json.JSONDecodeError, TypeError):
                bullet_points = []
            
            # Create summary dict for response
            summary_data = {
                "id": summary_obj.id,
                "summary_text": summary_obj.summary_text,
                "bullet_points": bullet_points,
                "summary_type": summary_obj.summary_type,
                "created_at": summary_obj.created_at,
                "document_id": summary_obj.document_id
            }
        else:
            summary_data = None
        
        logger.info(f"Document processed: {document.original_filename}")
        
        return AnalysisResult(
            document_id=document_id,
            summary=summary_data,
            keywords=keywords_list,
            processing_status="completed"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Processing error: {e}")
        
        # Update document status
        if 'document' in locals():
            document.processing_status = "failed"
            document.processing_error = str(e)
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document processing failed"
        )

@router.get("/", response_model=List[DocumentSchema])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's documents."""
    try:
        documents = db.query(Document).filter(
            Document.owner_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        return documents
    
    except Exception as e:
        logger.error(f"Get documents error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )

@router.get("/{document_id}", response_model=DocumentWithContent)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific document with content."""
    try:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return document
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get document error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )

@router.get("/{document_id}/analysis", response_model=DocumentAnalysis)
async def get_document_analysis(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get document analysis (summary, keywords, etc.)."""
    try:
        # Get document
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Get summary
        summary = db.query(Summary).filter(Summary.document_id == document_id).first()
        
        # Get keywords
        keywords = db.query(Keyword).filter(Keyword.document_id == document_id).all()
        keyword_list = [kw.keyword for kw in keywords]
        
        # Parse bullet points
        bullet_points = []
        if summary and summary.bullet_points:
            try:
                bullet_points = json.loads(summary.bullet_points)
            except:
                bullet_points = []
        
        return DocumentAnalysis(
            document=document,
            summary=summary.summary_text if summary else None,
            bullet_points=bullet_points,
            keywords=keyword_list,
            qa_available=document.processing_status == "completed"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document analysis"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a document and its associated data."""
    try:
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete file from disk
        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database (cascading will handle related records)
        db.delete(document)
        db.commit()
        
        logger.info(f"Document deleted: {document.original_filename}")
        
        return {"success": True, "message": "Document deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete document error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )