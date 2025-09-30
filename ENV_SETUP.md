# 🔐 Environment Setup Guide

## ⚠️ PENTING - Environment Variables

File `.env` dan `.env.local` berisi informasi sensitif seperti API keys dan tidak boleh di-push ke GitHub!

## 🚀 Setup Development Environment

### 1. Frontend Environment
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local dan isi dengan konfigurasi Anda
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NODE_ENV=development
```

### 2. Backend Environment  
```bash
cd backend

# Copy template
cp .env.example .env

# Edit backend/.env dan isi dengan API keys Anda
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key-here
DATABASE_URL=sqlite:///./researchmate.db
```

## 🔑 Cara Mendapatkan API Keys

### Groq API Key (Required)
1. Kunjungi https://console.groq.com/
2. Sign up atau login
3. Buat API key baru
4. Copy API key ke `backend/.env`:
   ```
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxx
   ```