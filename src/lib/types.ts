// User types
export interface User {
    id: number
    email: string
    username: string
    full_name?: string
    is_active: boolean
    created_at: string
}

export interface LoginResponse {
    access_token: string
    token_type: string
}

// Document types
export interface Document {
    id: number
    filename: string
    original_filename: string
    file_size: number
    processing_status: 'uploaded' | 'processing' | 'completed' | 'failed'
    word_count?: number
    char_count?: number
    page_count?: number
    created_at: string
    processed_at?: string
}

export interface DocumentWithContent extends Document {
    extracted_text?: string
    pdf_title?: string
    pdf_author?: string
    pdf_subject?: string
}

export interface Summary {
    id: number
    summary_text: string
    bullet_points?: string[]
    created_at: string
    document_id: number
}

export interface Keyword {
    id: number
    keyword: string
    score?: number
    extraction_method?: string
    created_at: string
    document_id: number
}

export interface AnalysisResult {
    document_id: number
    summary?: Summary
    keywords: Keyword[]
    processing_status: string
    error_message?: string
}

export interface DocumentAnalysis {
    document: Document
    summary?: string
    bullet_points: string[]
    keywords: string[]
    qa_available: boolean
}

export interface UploadResponse {
    success: boolean
    document_id?: number
    filename: string
    message: string
    processing_job_id?: number
}

export interface FileUpload {
    file: File
    progress: number
    status: 'uploading' | 'processing' | 'completed' | 'error'
    result?: AnalysisResult
    error?: string
    document_id?: number
}

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

export interface QARequest {
    question: string
    document_id: number
    conversation_history?: ChatMessage[]
}

export interface QAResponse {
    question: string
    answer: string
    confidence_score?: number
    context_used?: string
}

export interface QASession {
    id: number
    question: string
    answer: string
    confidence_score?: number
    created_at: string
    document_id: number
}

export interface ErrorResponse {
    success: false
    error: string
    details?: string
}