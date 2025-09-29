@echo off
REM ResearchMate Backend Startup Script for Windows

echo 🚀 Starting ResearchMate Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating environment file...
    copy .env.example .env
    echo ✅ Please update .env with your configuration
)

REM Create directories
echo 📁 Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "model_cache" mkdir model_cache

REM Start the server
echo 🌟 Starting FastAPI server...
echo 🌐 API will be available at: http://localhost:8000
echo 📖 API docs will be available at: http://localhost:8000/docs
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause