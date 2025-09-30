import { AnalysisResult, QAResponse, UploadResponse, LoginResponse, User, Document, QASession, ChatMessage } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

class ApiService {
    private getAuthHeaders(): HeadersInit {
        if (typeof window === 'undefined') {
            return {
                'Content-Type': 'application/json'
            }
        }

        const token = localStorage.getItem('access_token')
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        }
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))

            // Handle authentication errors specifically
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token')
                }
                if (endpoint !== '/auth/login/json') {
                    throw new Error('Session expired. Please login again.')
                }
            }

            throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    // Authentication methods
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await this.makeRequest<LoginResponse>("/auth/login/json", {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
            }),
        })

        // Store token in localStorage
        if (response.access_token && typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token)
        }

        return response
    }

    async register(email: string, username: string, password: string, fullName?: string): Promise<User> {
        return this.makeRequest<User>("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                email,
                username,
                password,
                full_name: fullName,
            }),
        })
    }

    async getCurrentUser(): Promise<User> {
        return this.makeRequest<User>("/auth/me")
    }

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
        }
    }

    isAuthenticated(): boolean {
        if (typeof window === 'undefined') {
            return false // Server-side rendering
        }
        return !!localStorage.getItem('access_token')
    }

    // Document methods
    async uploadFile(file: File): Promise<UploadResponse> {
        if (typeof window === 'undefined') {
            throw new Error('File upload not available on server-side')
        }

        const token = localStorage.getItem('access_token')

        if (!token) {
            throw new Error('Authentication required. Please login first.')
        }

        const formData = new FormData()
        formData.append("file", file)

        const url = `${API_BASE_URL}/documents/upload`
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type for FormData - browser will set it automatically with boundary
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || errorData.detail || `Upload failed: ${response.status}`)
        }

        return response.json()
    }

    async processDocument(documentId: number): Promise<AnalysisResult> {
        return this.makeRequest<AnalysisResult>(`/documents/${documentId}/process`, {
            method: "POST",
        })
    }

    async getDocuments(): Promise<Document[]> {
        return this.makeRequest<Document[]>("/documents/")
    }

    async getDocument(documentId: number): Promise<Document> {
        return this.makeRequest<Document>(`/documents/${documentId}`)
    }

    async getDocumentAnalysis(documentId: number): Promise<AnalysisResult> {
        return this.makeRequest<AnalysisResult>(`/documents/${documentId}/analysis`)
    }

    async deleteDocument(documentId: number): Promise<{ success: boolean; message: string }> {
        return this.makeRequest(`/documents/${documentId}`, {
            method: "DELETE",
        })
    }

    // Q&A methods
    async askQuestion(question: string, documentId: number, conversationHistory?: ChatMessage[]): Promise<QAResponse> {
        return this.makeRequest<QAResponse>("/qa/", {
            method: "POST",
            body: JSON.stringify({
                question,
                document_id: documentId,
                conversation_history: conversationHistory || [],
            }),
        })
    }

    async getQAHistory(documentId: number): Promise<QASession[]> {
        return this.makeRequest<QASession[]>(`/qa/document/${documentId}`)
    }

    async getUserQAHistory(skip: number = 0, limit: number = 100): Promise<QASession[]> {
        return this.makeRequest<QASession[]>(`/qa/user?skip=${skip}&limit=${limit}`)
    }

    async deleteQASession(sessionId: number): Promise<{ success: boolean; message: string }> {
        return this.makeRequest(`/qa/${sessionId}`, {
            method: "DELETE",
        })
    }

    // Health check endpoint
    async healthCheck(): Promise<{ status: string; service: string; version: string }> {
        const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
        return response.json()
    }
}

export const apiService = new ApiService()