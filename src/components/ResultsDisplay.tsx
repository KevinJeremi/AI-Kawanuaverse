"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Key, Lightbulb } from "lucide-react"
import { AnalysisResult } from "@/lib/types"

interface ResultsDisplayProps {
    results: AnalysisResult | null
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
    if (!results) return null

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut" as const
            }
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-4xl mx-auto space-y-6"
        >
            {/* Summary Section */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <span>Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300 leading-relaxed">
                            {results.summary?.summary_text || 'No summary available'}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Key Points Section */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                            <span>Key Points</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {(results.summary?.bullet_points || []).map((bullet: string, index: number) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start space-x-3"
                                >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-300">{bullet}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Keywords Section */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Key className="w-5 h-5 text-green-400" />
                            <span>Keywords</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {results.keywords && results.keywords.length > 0 ? (
                                results.keywords.map((keyword, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Badge
                                            variant="secondary"
                                            className="bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
                                        >
                                            {typeof keyword === 'string' ? keyword : keyword.keyword}
                                        </Badge>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">No keywords extracted</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}