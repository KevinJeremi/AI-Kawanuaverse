"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageCircle, Bot, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { QARequest, QAResponse } from "@/lib/types"

interface QAComponentProps {
    onAskQuestion: (question: string) => Promise<QAResponse>
    isLoading?: boolean
}

interface ChatMessage {
    id: string
    type: "user" | "assistant"
    content: string
    timestamp: Date
}

export function QAComponent({ onAskQuestion, isLoading = false }: QAComponentProps) {
    const [question, setQuestion] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim() || isLoading) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "user",
            content: question,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setQuestion("")

        try {
            const response = await onAskQuestion(question)

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: response.answer,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.",
                timestamp: new Date()
            }

            setMessages(prev => [...prev, errorMessage])
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                    <span>Tanya Jawab</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`
                    max-w-[80%] rounded-lg p-3 ${message.type === "user"
                                            ? "bg-blue-600 text-white ml-12"
                                            : "bg-gray-800 text-gray-200 mr-12"
                                        }
                  `}>
                                        <div className="flex items-start space-x-2">
                                            <div className="flex-shrink-0">
                                                {message.type === "user" ? (
                                                    <User className="w-4 h-4 mt-0.5" />
                                                ) : (
                                                    <Bot className="w-4 h-4 mt-0.5 text-green-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-gray-800 text-gray-200 rounded-lg p-3 mr-12">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="w-4 h-4 text-green-400" />
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Tanyakan sesuatu tentang dokumen..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={!question.trim() || isLoading}
                            size="icon"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>

                    {messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Tanyakan apapun tentang dokumen yang diunggah</p>
                            <p className="text-sm mt-1">Coba tanya: "Apa metodologi utama yang digunakan?" atau "Apa temuan utamanya?"</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}