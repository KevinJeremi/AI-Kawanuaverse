"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { FileUploadComponent } from "@/components/FileUpload"
import { ResultsDisplay } from "@/components/ResultsDisplay"
import { QAComponent } from "@/components/QAComponent"
import { FeaturesSection } from "@/components/FeaturesSection"
import { DevelopmentInfo } from "@/components/DevelopmentInfo"
import { LoadingSpinner } from "@/components/ui/loading"
import { Component as AnimatedBackground } from "@/components/ui/raycast-animated-background"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/lib/api"
import { AnalysisResult, QAResponse, ChatMessage } from "@/lib/types"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [documentId, setDocumentId] = useState<number | null>(null)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  const handleFileUpload = async (file: File) => {
    if (!isAuthenticated) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Upload file
      const uploadResponse = await apiService.uploadFile(file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadResponse.success && uploadResponse.document_id) {
        setDocumentId(uploadResponse.document_id)

        // Start processing
        setIsProcessing(true)

        try {
          // Process document and get results directly
          const analysis = await apiService.processDocument(uploadResponse.document_id)
          setAnalysisResult(analysis)
        } catch (processError) {
          console.error('Processing error:', processError)
          throw new Error('Document processing failed')
        } finally {
          setIsProcessing(false)
        }
      } else {
        throw new Error(uploadResponse.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      // For demo purposes, create mock data
      setTimeout(() => {
        const mockAnalysis: AnalysisResult = {
          document_id: Math.floor(Math.random() * 1000),
          summary: {
            id: 1,
            summary_text: "This is a mock summary for demonstration purposes.",
            bullet_points: [
              "Key finding 1: Important discovery in the field",
              "Key finding 2: Novel methodology presented",
              "Key finding 3: Significant results obtained"
            ],
            created_at: new Date().toISOString(),
            document_id: Math.floor(Math.random() * 1000)
          },
          keywords: [
            { id: 1, keyword: "research", created_at: new Date().toISOString(), document_id: 1 },
            { id: 2, keyword: "analysis", created_at: new Date().toISOString(), document_id: 1 },
            { id: 3, keyword: "methodology", created_at: new Date().toISOString(), document_id: 1 },
            { id: 4, keyword: "results", created_at: new Date().toISOString(), document_id: 1 },
            { id: 5, keyword: "findings", created_at: new Date().toISOString(), document_id: 1 }
          ],
          processing_status: 'completed'
        }

        setAnalysisResult(mockAnalysis)
        setDocumentId(Math.floor(Math.random() * 1000))
        setUploadProgress(100)
        setIsProcessing(false)
      }, 2000)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
      }, 500)
    }
  }

  const handleAskQuestion = async (question: string, conversationHistory?: ChatMessage[]): Promise<QAResponse> => {
    if (!documentId) {
      throw new Error("No document selected")
    }

    try {
      const response = await apiService.askQuestion(question, documentId, conversationHistory)
      return response
    } catch (error) {
      console.error("QA error:", error)
      // For demo purposes, return mock response
      return {
        question: question,
        answer: `Ini adalah jawaban contoh untuk pertanyaan: "${question}". Dalam implementasi sesungguhnya, jawaban ini akan dihasilkan oleh model AI yang menganalisis konten dokumen.`,
        confidence_score: 0.85,
        context_used: "Konteks contoh dari analisis dokumen..."
      }
    }
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        {/* Animated Background Layer */}
        <div className="fixed inset-0 z-0">
          <AnimatedBackground />
        </div>

        {/* Content Layer */}
        <div className="text-center relative z-10">
          <LoadingSpinner size="lg" />
          <p className="text-gold mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render main content if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gold-gradient">
              AI Kawanuaverse Academic Intelligence
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transformasi dokumen penelitian dengan kecerdasan buatan terdepan - analisis mendalam, ringkasan cerdas, dan Q&A interaktif
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Development Info - Positioned Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="lg:col-span-1"
            >
              <DevelopmentInfo />
            </motion.div>

            {/* File Upload Section - Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <FileUploadComponent
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                isProcessing={isProcessing}
              />
            </motion.div>
          </div>

          <div className="space-y-8 mt-8">

            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8"
              >
                <div className="max-w-md mx-auto bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-white">Analyzing Document...</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    AI is extracting key insights, generating summaries, and identifying important keywords from your document.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Results Section */}
            {analysisResult && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ResultsDisplay results={analysisResult} />
              </motion.div>
            )}

            {/* Q&A Section */}
            {analysisResult && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <QAComponent
                  onAskQuestion={handleAskQuestion}
                  isLoading={false}
                />
              </motion.div>
            )}
          </div>

          {/* Features Section - Show when no results */}
          {!analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FeaturesSection />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
