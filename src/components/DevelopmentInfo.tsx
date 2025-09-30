"use client"

import { motion } from "framer-motion"
import { ExternalLink, Code, Brain, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function DevelopmentInfo() {
    const techStack = [
        { name: "Next.js 15", color: "bg-black text-white" },
        { name: "React 19", color: "bg-blue-600 text-white" },
        { name: "TypeScript", color: "bg-blue-700 text-white" },
        { name: "FastAPI", color: "bg-green-600 text-white" },
        { name: "AI Integration", color: "bg-purple-600 text-white" },
        { name: "Tailwind CSS", color: "bg-cyan-500 text-white" }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-8 ml-0 mr-auto"
        >
            <Card className="border-green-800 bg-green-950/20 shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-3 text-green-400">
                        <div className="w-8 h-8 relative">
                            <Image
                                src="/logo.png"
                                alt="AI Kawanuaverse Logo"
                                width={32}
                                height={32}
                                className="rounded-lg"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Brain className="w-5 h-5" />
                            <span>AI Kawanuaverse</span>
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-3 rounded-lg border border-green-800/30">
                        <p className="text-gray-200 text-sm leading-relaxed">
                            🤖 <strong>AI Kawanuaverse Aktif</strong> - Platform AI untuk analisis dokumen akademik yang didukung oleh teknologi machine learning terkini.
                            Sistem AI telah terintegrasi dan siap memberikan analisis mendalam untuk penelitian Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-white flex items-center space-x-2">
                                <Code className="w-4 h-4" />
                                <span>Frontend Stack</span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {techStack.map((tech) => (
                                    <Badge key={tech.name} className={`${tech.color} text-xs`}>
                                        {tech.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-emerald-400">
                                <Brain className="w-4 h-4" />
                                <span className="font-semibold text-sm">AI System Status</span>
                            </div>
                            <div className="text-gray-300 text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>FastAPI Backend Active</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span>AI Analysis Ready</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <span>NLP Models Loaded</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
                        <a href="https://github.com/KevinJeremi/AI-Kawanuaverse" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs hover:bg-blue-900/20">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Source Code
                            </Button>
                        </a>
                        <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs hover:bg-purple-900/20">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                API Docs
                            </Button>
                        </a>
                        <Button variant="ghost" size="sm" className="text-xs text-green-400 cursor-default">
                            <Sparkles className="w-3 h-3 mr-1" />
                            v1.0.0-AI
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}