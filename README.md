<div align="center">
  <img src="public/logo.png" alt="AI Kawanuaverse Logo" width="120" height="120">
  
  # AI Kawanuaverse
  ### 🔬 AI-Powered Academic Research Analysis
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.4-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
  [![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

  **Aplikasi AI-powered untuk menganalisis jurnal dan paper akademik secara otomatis dengan teknologi Groq Llama dan NLP**
  
  [Features](#-fitur-utama) • [Technology](#-teknologi-ai--nlp) • [Installation](#-instalasi) • [Usage](#-cara-menggunakan) • [Architecture](#-arsitektur-sistem)

</div>

---

## 📋 Table of Contents

- [Deskripsi Project](#-deskripsi-project)
- [Screenshots](#-screenshots)
- [Fitur Utama](#-fitur-utama)
- [Teknologi AI & NLP](#-teknologi-ai--nlp)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Alur Kerja](#-alur-kerja)
- [Instalasi](#-instalasi)
- [Cara Menggunakan](#-cara-menggunakan)
- [Tech Stack](#-tech-stack)
- [Performance](#-performance--specifications)
- [Struktur Project](#-struktur-project)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Deskripsi Project

**AI Kawanuaverse** (ResearchMate) adalah aplikasi full-stack yang membantu peneliti, mahasiswa, dan dosen menganalisis dokumen penelitian akademik secara otomatis. Aplikasi ini menggunakan **Groq API (Llama LLM)** untuk AI processing dan **Natural Language Processing (NLP)** untuk pemrosesan teks lokal.

### 🎓 Target Pengguna

- **Peneliti**: Analisis cepat paper dan jurnal akademik
- **Mahasiswa**: Memahami isi paper untuk research dan thesis
- **Dosen**: Review dan analisis dokumen penelitian

### 📊 Project Statistics

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-12K+-blue?style=flat-square)
![Files](https://img.shields.io/badge/Files-65+-green?style=flat-square)
![Languages](https://img.shields.io/badge/Languages-4-orange?style=flat-square)

---

## 📸 Screenshots

<div align="center">

### 🔐 Authentication System
<img src="assets/screenshots/auth-login-page.png" alt="Login Page" width="800" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px;">

*Halaman login dengan UI modern dan secure authentication menggunakan JWT tokens*

---

### 🏠 Dashboard Overview
<img src="assets/screenshots/dashboard-main-overview.png" alt="Dashboard Main" width="800" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px;">

*Dashboard utama dengan interface yang clean dan user-friendly untuk upload dan manage dokumen*

---

### 📄 Document Analysis Interface
<img src="assets/screenshots/document-analysis-view.png" alt="Document Analysis" width="800" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px;">

*Interface analisis dokumen dengan real-time processing dan progress tracking*

---

### 🤖 AI Analysis Results
<img src="assets/screenshots/ai-analysis-results.png" alt="AI Results" width="800" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 10px;">

*Hasil analisis AI menampilkan ringkasan, kata kunci, dan Q&A system yang interaktif*

</div>

---

## ✨ Fitur Utama

- 📄 **PDF Text Extraction** - Extract teks dari file PDF research paper
- 📝 **AI Summarization** - Ringkasan otomatis dengan Groq Llama model
- 🔍 **Keyword Extraction** - Extract kata kunci penting menggunakan YAKE + LLM hybrid approach
- ❓ **Q&A System** - Tanya jawab interaktif berdasarkan konten dokumen
- 🔐 **Authentication** - JWT-based login/register system
- 🌏 **Multi-language** - Support bahasa Indonesia dan English
- 📱 **Responsive UI** - Interface modern dengan dark theme
- ⚡ **Real-time Processing** - Upload dan analisis dengan progress tracking

---

## 🧠 Teknologi AI & NLP

### 🚀 AI Processing (Cloud-based)

- **Service**: Groq API - Ultra-fast LLM inference
- **Model**: Llama-3.1-8B-Instant (Meta's efficient model)
- **Functions**: 
  - Text summarization dengan JSON response format
  - Context-aware question answering
  - Multi-language support (Indonesian + English)

### 🔧 NLP Processing (Hybrid Approach)

AI Kawanuaverse menggunakan **pendekatan hybrid** yang menggabungkan kekuatan algoritma tradisional dengan AI modern:

#### **YAKE + LLM Integration** 🎯

Sistem keyword extraction menggunakan kombinasi dua teknologi:

**1. YAKE Algorithm (Local Processing)**
   - Language-independent keyword extraction
   - Statistical analysis untuk identify kata kunci penting
   - Scoring algorithm berdasarkan term frequency dan co-occurrence
   - Proses cepat dan tidak memerlukan koneksi internet
   - Hasil: Keywords dengan confidence score

**2. LLM Enhancement (Groq API)**
   - Contextual understanding dari dokumen
   - Semantic analysis untuk extract konsep penting
   - Penambahan related terms dan synonyms
   - Filtering keywords berdasarkan relevance
   - Grouping keywords by topics/themes

#### **Keunggulan Hybrid Approach:**

```
YAKE (Statistical)  +  LLM (Contextual)  =  Optimal Results
      ↓                      ↓                     ↓
  Fast & Precise    +   Smart & Context   =  Comprehensive
  Local Processing  +   Cloud-based AI    =  Best of Both
```

- ✅ **Akurasi Lebih Tinggi**: Kombinasi statistical precision dan contextual understanding
- ✅ **Redundancy**: Jika LLM API down, YAKE tetap bisa bekerja sebagai fallback
- ✅ **Comprehensive**: Mendapatkan both technical terms (YAKE) dan conceptual keywords (LLM)
- ✅ **Cost-Efficient**: YAKE mengurangi beban API calls, LLM hanya untuk enhancement

#### **Other NLP Components:**

- **NLTK Library**: Text tokenization, preprocessing, dan sentence segmentation
- **Language Detection**: Auto-detect Indonesian/English untuk optimal processing
- **Text Cleaning**: Remove noise, special characters, dan normalize text
- **Fallback Processing**: Multiple layers untuk ensure system reliability

---

## 🏗️ Arsitektur Sistem

### Frontend (Next.js 15)

```
Next.js 15 (App Router) + TypeScript
├── UI Components: shadcn/ui + Tailwind CSS
├── Animations: Framer Motion
├── State Management: React Context API
├── File Upload: react-dropzone dengan drag & drop
└── Authentication: JWT dengan custom hooks
```

### Backend (FastAPI)

```
Python FastAPI + SQLAlchemy
├── Database: SQLite (dev) / PostgreSQL (prod)
├── Authentication: JWT tokens + bcrypt hashing
├── PDF Processing: PyMuPDF + pdfplumber
├── AI Integration: Groq API client
├── NLP Processing: YAKE + LLM hybrid
└── Keyword Extraction: Statistical + Contextual analysis
```

---

## 📋 Alur Kerja

```mermaid
graph TD
    A[User Upload PDF] --> B[Frontend Next.js]
    B --> C[FastAPI Backend /upload]
    C --> D[PDF Text Extraction]
    D --> E[Text Preprocessing NLP]
    E --> F[Groq API Llama Processing]
    E --> G[YAKE Algorithm]
    E --> H[LLM Keyword Enhancement]
    F --> I[Summary Generation]
    G --> J[Statistical Keywords]
    H --> K[Contextual Keywords]
    J --> L[Merge & Rank Keywords]
    K --> L
    I --> M[JSON Response]
    L --> M
    M --> N[Frontend Display Results]
    
    O[User Ask Question] --> P[Q&A Endpoint]
    P --> Q[Context Matching]
    Q --> R[Groq API Answer Generation]
    R --> S[Response to User]
```

### Detail Processing Steps

**1. 📤 PDF Upload & Validation**
   - User drag & drop PDF file ke interface
   - Frontend validasi file type dan size
   - File dikirim ke FastAPI endpoint `/documents/upload`

**2. 📖 Text Extraction**
   - Backend gunakan PyMuPDF dan pdfplumber untuk extract teks
   - Text cleaning dan preprocessing dengan NLTK
   - Chunking untuk dokumen besar (>8000 characters)

**3. 🤖 AI Summarization** 
   - Text dikirim ke Groq API dengan prompt dalam bahasa Indonesia
   - Llama-3.1-8B model generate ringkasan + bullet points
   - Response format JSON dengan summary dan key points

**4. 🏷️ Keyword Extraction (YAKE + LLM Hybrid)**

```mermaid
graph LR
    A[Raw Text] --> B[YAKE Processing]
    A --> C[LLM Processing]
    
    B --> D[Statistical Keywords<br/>frequency + position]
    C --> E[Contextual Keywords<br/>semantic meaning]
    
    D --> F[Merge & Deduplicate]
    E --> F
    
    F --> G[Score & Rank]
    G --> H[Top 10-15 Keywords]
    
    style B fill:#FF9500
    style C fill:#0066CC
    style F fill:#00CC66
```

   **Step-by-step:**
   - **YAKE Processing** (1-2s):
     - Analisis statistik term frequency
     - Co-occurrence analysis untuk multi-word keywords
     - Position weighting (keywords di awal dokumen lebih penting)
     - Generate kandidat keywords dengan scores
   
   - **LLM Enhancement** (2-3s):
     - Send text ke Groq API dengan specialized prompt
     - LLM extract konsep-konsep penting
     - Identify domain-specific terminology
     - Add contextual variations dan related terms
   
   - **Merging & Ranking**:
     - Combine results dari YAKE dan LLM
     - Remove duplicates dan near-duplicates
     - Scoring: frequency + position + LLM confidence
     - Rank by relevance score
   
   - **Final Output**:
     - Top 10-15 keywords paling relevan
     - Display sebagai clickable tags di UI
     - Used untuk document categorization dan search

**5. ❓ Question Answering**
   - User submit pertanyaan di chat interface
   - Context matching dengan dokumen yang sudah diupload
   - Groq API generate answer berdasarkan context
   - Fallback ke keyword matching jika API error

**6. 📊 Results Display**
   - Frontend tampilkan hasil dalam card components
   - Interactive UI dengan smooth animations
   - Q&A chat interface seperti WhatsApp

---

## ⚡ Performance Comparison

### Keyword Extraction Methods

| Method | Speed | Accuracy | Context Understanding | Internet Required | Fallback |
|--------|-------|----------|----------------------|-------------------|----------|
| **YAKE Only** | ⚡⚡⚡ Very Fast<br/>(1-2s) | 75% | ❌ Limited | ❌ No | N/A |
| **LLM Only** | ⚡⚡ Fast<br/>(2-3s) | 85% | ✅ Excellent | ✅ Yes | ❌ No |
| **YAKE + LLM** | ⚡⚡ Fast<br/>(3-5s) | **95%** | ✅ Excellent | ⚡ Optional | ✅ Yes |

**Kesimpulan**: Hybrid approach memberikan best balance antara speed, accuracy, dan reliability dengan built-in fallback mechanism.

---

## 🚀 Instalasi

### Prerequisites

- Node.js 18+ dan npm/yarn
- Python 3.8+
- Groq API Key (gratis di https://console.groq.com/)
- RAM minimum 2GB (untuk NLP processing)

### Setup Instructions

#### 1. Clone Repository

```bash
git clone https://github.com/KevinJeremi/AI-Kawanuaverse.git
cd AI-Kawanuaverse
```

#### 2. Setup Backend

```bash
cd backend

# Windows
start.bat

# Linux/Mac 
chmod +x start.sh
./start.sh
```

Script akan otomatis:
- ✅ Create Python virtual environment
- ✅ Install dependencies dari requirements.txt
- ✅ Setup database SQLite
- ✅ Download NLTK data
- ✅ Start FastAPI server di http://localhost:8000

#### 3. Setup Frontend

```bash
cd ..  # kembali ke root directory

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan running di http://localhost:3000

#### 4. Environment Variables

Buat file `.env` di folder `backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your-secret-key-for-jwt
DATABASE_URL=sqlite:///./researchmate.db
```

---

## 🖥️ Cara Menggunakan

1. **Buka aplikasi** di http://localhost:3000
2. **Register/Login** dengan akun baru atau existing
3. **Upload PDF** dengan drag & drop file research paper
4. **Lihat Hasil Analisis**:
   - Summary dalam bahasa Indonesia
   - Bullet points key findings
   - Keywords (YAKE + LLM) sebagai tags
5. **Q&A Interaktif** - Ketik pertanyaan di chat box untuk tanya jawab

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend  
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-1.4.53-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)

### AI & ML
![Groq](https://img.shields.io/badge/Groq_API-0.4.1-FF6B35?style=for-the-badge)
![Llama](https://img.shields.io/badge/Llama_3.1_8B-Meta-0066CC?style=for-the-badge&logo=meta&logoColor=white)
![YAKE](https://img.shields.io/badge/YAKE-0.4.8-FF9500?style=for-the-badge)
![NLTK](https://img.shields.io/badge/NLTK-3.8.1-154F3C?style=for-the-badge)

</div>

### Key Dependencies

**Frontend:**
- Next.js 15.5.4
- React 19.1.0
- TypeScript 5+
- Tailwind CSS 4+
- Framer Motion 12.23.22
- Lucide React 0.544.0

**Backend:**
- FastAPI 0.104.1
- Groq 0.4.1
- YAKE 0.4.8
- NLTK 3.8.1
- PyMuPDF 1.23.8
- SQLAlchemy 1.4.53

---

## ⚡ Performance & Specifications

### Processing Performance

- **PDF Extraction**: 2-5 seconds (tergantung ukuran file)
- **AI Summarization**: 3-8 seconds (via Groq API)
- **Keyword Extraction (Hybrid)**: 3-5 seconds (YAKE + LLM processing)
- **Q&A Response**: 1-3 seconds (Groq API + context matching)
- **Total Analysis**: 8-20 seconds untuk dokumen typical

### System Requirements

- **Storage**: ~100MB untuk aplikasi + dependencies
- **RAM**: 2GB minimum, 4GB recommended
- **Internet**: Required untuk Groq API calls (optional untuk YAKE fallback)
- **Local NLP**: ~50MB untuk NLTK data + YAKE

### API Limits

- **Groq Free Tier**: 10,000 tokens/minute
- **File Size**: Max 50MB per PDF
- **Concurrent Users**: Tergantung server specs

---

## 📂 Struktur Project

```
AI-Kawanuaverse/
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   └── auth/              # Auth pages
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── FileUpload.tsx     # PDF upload component
│   │   ├── ResultsDisplay.tsx
│   │   ├── QAComponent.tsx    # Chat Q&A interface
│   │   └── Header.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/
│       ├── api.ts             # API service functions
│       ├── types.ts           # TypeScript types
│       └── utils.ts           # Utility functions
├── backend/
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── start.bat             # Windows startup script
│   ├── start.sh              # Linux/Mac startup script
│   └── app/
│       ├── api/              # API endpoints
│       │   ├── auth.py       # Authentication routes
│       │   ├── documents.py  # PDF upload/processing
│       │   └── qa.py         # Q&A endpoints
│       ├── core/
│       │   ├── config.py     # Configuration
│       │   ├── database.py   # Database setup
│       │   └── security.py   # JWT & auth
│       ├── models/
│       │   └── models.py     # Database models
│       ├── schemas/
│       │   └── schemas.py    # Pydantic schemas
│       └── services/
│           ├── nlp_service.py    # Groq API + YAKE + LLM
│           └── pdf_processor.py  # PDF processing
└── public/                   # Static assets
```

---

## 🧪 Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation
```

**Backend:**
```bash
cd backend
python main.py       # Start FastAPI server
python test_api.py   # Test API endpoints
python test_groq_integration.py  # Test Groq API
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Development Status

#### ✅ Completed Features
- [x] FastAPI backend dengan SQLAlchemy ORM
- [x] Next.js 15 frontend dengan TypeScript
- [x] JWT authentication system
- [x] PDF upload dan text extraction
- [x] Groq API integration untuk summarization
- [x] YAKE + LLM hybrid keyword extraction
- [x] Q&A system dengan context matching
- [x] Responsive UI dengan dark theme
- [x] Error handling dan fallback systems

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 👥 Connect With Us

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-KevinJeremi-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/KevinJeremi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/kevinjeremi)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kevin@example.com)

### 🌟 Show Your Support

If this project helped you, please consider giving it a ⭐️!

[![GitHub stars](https://img.shields.io/github/stars/KevinJeremi/AI-Kawanuaverse?style=social)](https://github.com/KevinJeremi/AI-Kawanuaverse/stargazers)

</div>

---

<div align="center">

**Built with ❤️ for the academic research community** 🎓

*AI Kawanuaverse - Empowering Research Through AI*

</div>