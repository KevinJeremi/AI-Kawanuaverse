'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Component } from '@/components/ui/sign-in-flo'
import { useAuth } from '@/contexts/AuthContext'

interface AnimatedAuthFormsProps {
    onToggleMode?: () => void
}

export function AnimatedAuthForms({ onToggleMode }: AnimatedAuthFormsProps) {
    return <Component />
}

// Keep the old LoginForm for backward compatibility
interface LoginFormProps {
    onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
    return <AnimatedAuthForms onToggleMode={onToggleMode} />
}

// Keep the old RegisterForm for backward compatibility
interface RegisterFormProps {
    onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
    return <AnimatedAuthForms onToggleMode={onToggleMode} />
}