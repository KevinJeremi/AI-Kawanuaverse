"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatFileSize } from "@/lib/utils"
import { FileUpload } from "@/lib/types"

interface FileUploadProps {
    onFileUpload: (file: File) => void
    isUploading?: boolean
    uploadProgress?: number
    isProcessing?: boolean
}

export function FileUploadComponent({ onFileUpload, isUploading = false, uploadProgress = 0, isProcessing = false }: FileUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file && file.type === "application/pdf") {
            const newFileUpload: FileUpload = {
                file,
                progress: 0,
                status: "uploading"
            }

            setUploadedFiles(prev => [...prev, newFileUpload])
            onFileUpload(file)
        }
    }, [onFileUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"]
        },
        multiple: false,
        disabled: isUploading
    })

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <motion.div
                whileHover={!isUploading ? { scale: 1.02 } : {}}
                whileTap={!isUploading ? { scale: 0.98 } : {}}
            >
                <Card className={`
          border-2 border-dashed transition-all duration-300
          ${isDragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }
          ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}>
                    <CardContent className="p-8">
                        <div
                            {...getRootProps()}
                            className="flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <input {...getInputProps()} />

                            <motion.div
                                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`
                  p-4 rounded-full 
                  ${isDragActive ? "bg-blue-500/20" : "bg-gray-800"}
                `}
                            >
                                <Upload className={`w-8 h-8 ${isDragActive ? "text-blue-400" : "text-gray-400"}`} />
                            </motion.div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {isDragActive ? "Drop your PDF here" : "Upload Academic Paper"}
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Drag and drop a PDF file here, or click to browse
                                </p>
                                <Button variant="outline" disabled={isUploading}>
                                    Choose File
                                </Button>
                            </div>

                            <div className="text-xs text-gray-500">
                                Supported format: PDF (Max 10MB)
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <AnimatePresence>
                {uploadedFiles.map((fileUpload, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-8 h-8 text-blue-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {fileUpload.file.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatFileSize(fileUpload.file.size)}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {(fileUpload.status === "uploading" || isUploading) && !isProcessing && (
                                            <div className="w-20">
                                                <Progress value={uploadProgress} />
                                            </div>
                                        )}

                                        {(fileUpload.status === "processing" || isProcessing) && (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                                <span className="text-xs text-yellow-500">Analyzing...</span>
                                            </div>
                                        )}

                                        {fileUpload.status === "completed" && (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                <span className="text-xs text-green-500">Completed</span>
                                            </div>
                                        )}

                                        {fileUpload.status === "error" && (
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                <span className="text-xs text-red-500">Error</span>
                                            </div>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(index)}
                                            className="h-8 w-8"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}