"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface ErrorDisplayProps {
    title?: string
    message: string
    onRetry?: () => void
    retryText?: string
}

export function ErrorDisplay({
    title = "Something went wrong",
    message,
    onRetry,
    retryText = "Try Again"
}: ErrorDisplayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border-red-800 bg-red-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span>{title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 mb-4">{message}</p>
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-900"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {retryText}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Simple error component for inline use
interface ErrorProps {
    message: string
}

export function Error({ message }: ErrorProps) {
    return (
        <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-800">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
        </div>
    )
}