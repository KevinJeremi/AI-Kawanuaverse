from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.models.models import User, Document, QASession
from app.schemas.schemas import QARequest, QAResponse, QASession as QASessionSchema
from app.api.deps import get_current_active_user
from app.services.nlp_service import nlp_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=QAResponse)
async def ask_question(
    qa_request: QARequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Ask a question about a document."""
    try:
        # Get document
        document = db.query(Document).filter(
            Document.id == qa_request.document_id,
            Document.owner_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if document.processing_status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document processing not completed"
            )
        
        if not document.extracted_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content available for question answering"
            )
        
        # Generate answer
        qa_result = await nlp_service.answer_question(
            question=qa_request.question,
            context=document.extracted_text
        )
        
        if not qa_result.get('answer'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate answer"
            )
        
        # Save QA session
        qa_session = QASession(
            document_id=qa_request.document_id,
            user_id=current_user.id,
            question=qa_request.question,
            answer=qa_result['answer'],
            confidence_score=qa_result.get('confidence', 0.5),
            context_used=qa_result.get('context_used', '')
        )
        
        db.add(qa_session)
        db.commit()
        
        logger.info(f"QA completed for document {qa_request.document_id} by user {current_user.username}")
        
        return QAResponse(
            question=qa_request.question,
            answer=qa_result['answer'],
            confidence_score=qa_result.get('confidence', 0.5),
            context_used=qa_result.get('context_used', '')
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"QA error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Question answering failed"
        )

@router.get("/document/{document_id}", response_model=List[QASessionSchema])
async def get_qa_history(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get QA history for a document."""
    try:
        # Verify document ownership
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Get QA sessions
        qa_sessions = db.query(QASession).filter(
            QASession.document_id == document_id,
            QASession.user_id == current_user.id
        ).order_by(QASession.created_at.desc()).all()
        
        return qa_sessions
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get QA history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve QA history"
        )

@router.get("/user", response_model=List[QASessionSchema])
async def get_user_qa_history(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all QA history for the current user."""
    try:
        qa_sessions = db.query(QASession).filter(
            QASession.user_id == current_user.id
        ).order_by(QASession.created_at.desc()).offset(skip).limit(limit).all()
        
        return qa_sessions
    
    except Exception as e:
        logger.error(f"Get user QA history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve QA history"
        )

@router.delete("/{session_id}")
async def delete_qa_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a QA session."""
    try:
        qa_session = db.query(QASession).filter(
            QASession.id == session_id,
            QASession.user_id == current_user.id
        ).first()
        
        if not qa_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QA session not found"
            )
        
        db.delete(qa_session)
        db.commit()
        
        return {"success": True, "message": "QA session deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete QA session error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete QA session"
        )