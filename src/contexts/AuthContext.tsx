'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/lib/types'
import { apiService } from '@/lib/api'

interface AuthContextType {
    user: User | null
    login: (username: string, password: string) => Promise<void>
    register: (email: string, username: string, password: string, fullName?: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!user && apiService.isAuthenticated()

    useEffect(() => {
        // Check if user is already authenticated on app start
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            if (apiService.isAuthenticated()) {
                const currentUser = await apiService.getCurrentUser()
                setUser(currentUser)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            // Clear invalid token and reset user state
            apiService.logout()
            setUser(null)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (username: string, password: string) => {
        try {
            setIsLoading(true)
            await apiService.login(username, password)

            // Get user data after successful login
            const currentUser = await apiService.getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            setUser(null)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (email: string, username: string, password: string, fullName?: string) => {
        try {
            setIsLoading(true)
            await apiService.register(email, username, password, fullName)

            // Auto login after registration
            await login(username, password)
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        apiService.logout()
        setUser(null)
    }

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        isAuthenticated,
        isLoading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}