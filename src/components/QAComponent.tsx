"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageCircle, Bot, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { QAResponse, ChatMessage } from "@/lib/types"

interface QAComponentProps {
    onAskQuestion: (question: string, conversationHistory?: ChatMessage[]) => Promise<QAResponse>
    isLoading?: boolean
}

interface LocalChatMessage {
    id: string
    type: "user" | "assistant"
    content: string
    timestamp: Date
}

export function QAComponent({ onAskQuestion, isLoading = false }: QAComponentProps) {
    const [question, setQuestion] = useState("")
    const [messages, setMessages] = useState<LocalChatMessage[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    // Function to scroll to bottom with smooth animation
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end"
        })
    }

    // Auto-scroll when messages change or when loading
    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim() || isLoading) return

        const userMessage: LocalChatMessage = {
            id: Date.now().toString(),
            type: "user",
            content: question,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setQuestion("")

        try {
            // Convert current messages to API format for conversation history
            const conversationHistory: ChatMessage[] = messages.map(msg => ({
                role: msg.type === "user" ? "user" : "assistant",
                content: msg.content,
                timestamp: msg.timestamp.toISOString()
            }))

            const response = await onAskQuestion(question, conversationHistory)

            const assistantMessage: LocalChatMessage = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: response.answer,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch {
            const errorMessage: LocalChatMessage = {
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
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-green-400" />
                        <span>💬 Chat dengan Kawanuaverse AI</span>
                    </div>
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMessages([])}
                            className="text-xs"
                        >
                            Bersihkan Chat
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Chat Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="space-y-4 max-h-96 overflow-y-auto scroll-smooth"
                    >
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
                                <div className="bg-gray-800 text-gray-200 rounded-lg p-3 mr-12 max-w-[80%]">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="w-4 h-4 text-green-400" />
                                        <div className="flex flex-col">
                                            <div className="flex space-x-1 mb-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <p className="text-xs text-gray-400">ResearchMate sedang menganalisis...</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Invisible div to scroll to */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Halo! Tanyakan apapun tentang paper ini, atau diskusi seputar penelitian..."
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
                        <div className="text-center py-8 text-gray-200">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-70 text-green-400" />
                            <p className="text-lg font-medium mb-2 text-white">👋 Hai! Saya ResearchMate AI</p>
                            <p className="mb-3 text-gray-200">Saya siap membantu Anda menganalisis paper ini dan diskusi seputar penelitian!</p>
                            <div className="text-sm space-y-1 max-w-md mx-auto">
                                <p className="font-medium text-green-400 mb-2">Yang bisa saya bantu:</p>
                                <p className="text-gray-300">• &quot;Apa metodologi yang digunakan dalam paper ini?&quot;</p>
                                <p className="text-gray-300">• &quot;Jelaskan temuan utama penelitian ini&quot;</p>
                                <p className="text-gray-300">• &quot;Apa saja keterbatasan dari penelitian ini?&quot;</p>
                                <p className="text-gray-300">• &quot;Bagaimana cara menganalisis data seperti ini?&quot;</p>
                                <p className="mt-3 text-xs text-gray-300">
                                    💡 Saya juga bisa diskusi topik penelitian umum yang masih terkait!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}