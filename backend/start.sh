#!/bin/bash

# ResearchMate Backend Startup Script

echo "🚀 Starting ResearchMate Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo "✅ Please update .env with your configuration"
fi

# Create directories
echo "📁 Creating necessary directories..."
mkdir -p uploads model_cache

# Start the server
echo "🌟 Starting FastAPI server..."
echo "🌐 API will be available at: http://localhost:8000"
echo "📖 API docs will be available at: http://localhost:8000/docs"
echo ""

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload