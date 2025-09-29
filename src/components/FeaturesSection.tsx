"use client"

import { motion } from "framer-motion"
import { FileText, Brain, MessageSquare, Key, Zap, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
    {
        icon: FileText,
        title: "PDF Analysis",
        description: "Upload and extract insights from academic papers with advanced AI processing"
    },
    {
        icon: Brain,
        title: "Smart Summaries",
        description: "Get concise summaries and key bullet points automatically generated"
    },
    {
        icon: MessageSquare,
        title: "Interactive Q&A",
        description: "Ask questions about the paper and get intelligent, context-aware answers"
    },
    {
        icon: Key,
        title: "Keyword Extraction",
        description: "Automatically identify and extract the most important keywords and topics"
    },
    {
        icon: Zap,
        title: "Fast Processing",
        description: "Lightning-fast analysis powered by modern AI models and optimized infrastructure"
    },
    {
        icon: Shield,
        title: "Secure & Private",
        description: "Your documents are processed securely with privacy protection"
    }
]

export function FeaturesSection() {
    return (
        <div className="py-16 bg-gray-900/50">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold mb-4 text-white">
                        Powerful Features for Academic Research
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        ResearchMate combines cutting-edge AI with intuitive design to revolutionize how you analyze academic papers
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full hover:border-blue-500/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-blue-600/20">
                                            <feature.icon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <span className="text-white">{feature.title}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-400">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}