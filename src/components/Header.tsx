"use client"

import { Brain, Github, HelpCircle, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"

export function Header() {
    const { user, logout, isAuthenticated } = useAuth()

    const handleLogout = () => {
        logout()
    }

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm"
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="AI Kawanuaverse Logo"
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">AI Kawanuaverse</h1>
                            <p className="text-sm text-gray-400">AI for Academic Analysis</p>
                        </div>
                    </motion.div>

                    <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="icon">
                            <Github className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <HelpCircle className="w-5 h-5" />
                        </Button>

                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-800">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">
                                        {user.full_name || user.username}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="border-red-600 text-red-400 hover:bg-red-900"
                                >
                                    <LogOut className="w-4 h-4 mr-1" />
                                    Logout
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </motion.header>
    )
}