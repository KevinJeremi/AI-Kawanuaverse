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

### Secret Key untuk JWT
Generate secret key yang aman:
```bash
# Menggunakan Python
python -c "import secrets; print(secrets.token_hex(32))"

# Atau menggunakan OpenSSL
openssl rand -hex 32
```

## 🛡️ Security Checklist

- ✅ File `.env` dan `.env.local` ada di `.gitignore`
- ✅ API keys tidak ter-commit ke Git
- ✅ Secret keys unik untuk setiap environment
- ✅ File `.env.example` tidak berisi data sensitif
- ✅ Production environment menggunakan environment variables yang aman

## 🔍 Troubleshooting

### Jika API Key Error:
1. Pastikan `GROQ_API_KEY` ada di `backend/.env`
2. Cek validity API key di Groq console  
3. Restart backend server setelah update `.env`

### Jika JWT Error:
1. Pastikan `SECRET_KEY` ada dan panjangnya minimal 32 karakter
2. Restart backend server
3. Clear browser localStorage jika perlu

## 📝 Production Deployment

Untuk production, jangan gunakan file `.env`. Set environment variables di:
- **Vercel**: Project Settings > Environment Variables
- **Netlify**: Site Settings > Build & Deploy > Environment Variables  
- **Railway**: Variables tab
- **Docker**: Docker compose atau container environment
- **VPS**: Export environment variables di shell profile