from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Document Schemas
class DocumentBase(BaseModel):
    filename: str
    original_filename: str

class DocumentCreate(DocumentBase):
    file_size: int
    mime_type: str

class Document(DocumentBase):
    id: int
    file_size: int
    processing_status: str
    word_count: Optional[int] = None
    char_count: Optional[int] = None
    page_count: Optional[int] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DocumentWithContent(Document):
    extracted_text: Optional[str] = None
    pdf_title: Optional[str] = None
    pdf_author: Optional[str] = None
    pdf_subject: Optional[str] = None

# Summary Schemas
class SummaryBase(BaseModel):
    summary_text: str
    bullet_points: Optional[List[str]] = None
    summary_type: str = "auto"

class SummaryCreate(SummaryBase):
    document_id: int

class Summary(SummaryBase):
    id: int
    created_at: datetime
    document_id: int
    
    class Config:
        from_attributes = True

# Keyword Schemas
class KeywordBase(BaseModel):
    keyword: str
    score: Optional[float] = None
    extraction_method: Optional[str] = None

class KeywordCreate(KeywordBase):
    document_id: int

class Keyword(KeywordBase):
    id: int
    created_at: datetime
    document_id: int
    
    class Config:
        from_attributes = True

# QA Schemas
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None

class QARequest(BaseModel):
    question: str
    document_id: int
    conversation_history: Optional[List[ChatMessage]] = []

class QAResponse(BaseModel):
    question: str
    answer: str
    confidence_score: Optional[float] = None
    context_used: Optional[str] = None

class QASession(BaseModel):
    id: int
    question: str
    answer: str
    confidence_score: Optional[float] = None
    created_at: datetime
    document_id: int
    
    class Config:
        from_attributes = True

# Processing Schemas
class ProcessingJobBase(BaseModel):
    job_type: str
    status: str = "pending"
    progress: int = 0

class ProcessingJob(ProcessingJobBase):
    id: int
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Analysis Result Schemas
class AnalysisResult(BaseModel):
    document_id: int
    summary: Optional[Any] = None  # Using Any to handle dict or Summary model
    keywords: List[Keyword] = []
    processing_status: str
    error_message: Optional[str] = None

class DocumentAnalysis(BaseModel):
    document: Document
    summary: Optional[str] = None
    bullet_points: List[str] = []
    keywords: List[str] = []
    qa_available: bool = False

# File Upload Response
class UploadResponse(BaseModel):
    success: bool
    document_id: Optional[int] = None
    filename: str
    message: str
    processing_job_id: Optional[int] = None

# Error Response
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[str] = None

# Success Response
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None