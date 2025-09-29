'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm, RegisterForm } from '@/components/AuthForms'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, isLoading, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 p-4">
            <div className="w-full max-w-md">
                {isLogin ? (
                    <LoginForm onToggleMode={() => setIsLogin(false)} />
                ) : (
                    <RegisterForm onToggleMode={() => setIsLogin(true)} />
                )}
            </div>
        </div>
    )
}