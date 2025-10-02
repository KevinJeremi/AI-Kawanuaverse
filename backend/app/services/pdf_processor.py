import fitz  # PyMuPDF
import pdfplumber
import re
import logging
from typing import Optional, Tuple
from pathlib import Path
import tempfile
import os

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Handle PDF text extraction with multiple methods for reliability."""
    
    def __init__(self):
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.supported_extensions = ['.pdf']
    
    def validate_pdf(self, file_path: Path) -> Tuple[bool, str]:
        """Validate PDF file before processing."""
        try:
            # Check file size
            if file_path.stat().st_size > self.max_file_size:
                return False, "File size exceeds 50MB limit"
            
            # Check extension
            if file_path.suffix.lower() not in self.supported_extensions:
                return False, "Only PDF files are supported"
            
            # Try to open with PyMuPDF
            doc = fitz.open(file_path)
            if doc.page_count == 0:
                return False, "PDF has no pages"
            doc.close()
            
            return True, "Valid PDF file"
        
        except Exception as e:
            logger.error(f"PDF validation error: {str(e)}")
            return False, f"Invalid PDF file: {str(e)}"
    
    def extract_text_pymupdf(self, file_path: Path) -> Optional[str]:
        """Extract text using PyMuPDF - good for most PDFs."""
        try:
            doc = fitz.open(file_path)
            text = ""
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                page_text = page.get_text()
                text += page_text + "\n\n"
            
            doc.close()
            return text.strip()
        
        except Exception as e:
            logger.error(f"PyMuPDF extraction error: {str(e)}")
            return None
    
    def extract_text_pdfplumber(self, file_path: Path) -> Optional[str]:
        """Extract text using pdfplumber - good for tables and structured content."""
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            
            return text.strip()
        
        except Exception as e:
            logger.error(f"pdfplumber extraction error: {str(e)}")
            return None
    
    def clean_text(self, text: str) -> str:
        """Clean extracted text from common PDF artifacts."""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        text = re.sub(r'\t+', ' ', text)
        
        # Remove common academic paper headers/footers and metadata
        # These patterns appear frequently in journal PDFs
        metadata_patterns = [
            r'(?i)^corresponding author[^\n]*$',
            r'(?i)^author name[^\n]*$',
            r'(?i)^copyright.*?\d{4}[^\n]*$',
            r'(?i)^©.*?\d{4}[^\n]*$',
            r'(?i)^all rights reserved[^\n]*$',
            r'(?i)^published by[^\n]*$',
            r'(?i)^issn[:\s]*[\d-]+[^\n]*$',
            r'(?i)^doi[:\s]*[^\n]*$',
            r'(?i)^e-?mail[:\s]*[^\n]*$',
            r'(?i)^received[:\s]*[^\n]*$',
            r'(?i)^accepted[:\s]*[^\n]*$',
            r'(?i)^revised[:\s]*[^\n]*$',
            r'(?i)^available online[^\n]*$',
            r'(?i)^this is an open access[^\n]*$',
        ]
        
        for pattern in metadata_patterns:
            text = re.sub(pattern, '', text, flags=re.MULTILINE)
        
        # Remove page numbers and headers/footers (basic patterns)
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            
            # Skip likely page numbers
            if re.match(r'^\d+$', line):
                continue
            
            # Skip very short lines that are likely artifacts
            if len(line) < 3:
                continue
            
            # Skip lines with mostly special characters
            if len(re.sub(r'[^a-zA-Z0-9\s]', '', line)) < len(line) * 0.5:
                continue
            
            # Skip lines that look like email addresses or URLs
            if re.search(r'@|http://|https://|www\.', line) and len(line) < 100:
                continue
            
            # Skip common header/footer indicators
            skip_patterns = [
                r'(?i)^page \d+ of \d+',
                r'(?i)^\d+\s*\|\s*page',
                r'(?i)^vol\.?\s*\d+',
                r'(?i)^pp\.?\s*\d+-\d+',
            ]
            
            should_skip = False
            for pattern in skip_patterns:
                if re.match(pattern, line):
                    should_skip = True
                    break
            
            if not should_skip:
                cleaned_lines.append(line)
        
        # Rejoin text
        cleaned_text = '\n'.join(cleaned_lines)
        
        # Fix common encoding issues
        cleaned_text = cleaned_text.replace('â€™', "'")
        cleaned_text = cleaned_text.replace('â€œ', '"')
        cleaned_text = cleaned_text.replace('â€�', '"')
        cleaned_text = cleaned_text.replace('â€"', '-')
        
        return cleaned_text.strip()
    
    def extract_metadata(self, file_path: Path) -> dict:
        """Extract PDF metadata."""
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata
            page_count = doc.page_count
            doc.close()
            
            return {
                'title': metadata.get('title', ''),
                'author': metadata.get('author', ''),
                'subject': metadata.get('subject', ''),
                'creator': metadata.get('creator', ''),
                'producer': metadata.get('producer', ''),
                'creation_date': metadata.get('creationDate', ''),
                'modification_date': metadata.get('modDate', ''),
                'page_count': page_count
            }
        
        except Exception as e:
            logger.error(f"Metadata extraction error: {str(e)}")
            return {}
    
    def process_pdf(self, file_path: Path) -> dict:
        """Main method to process PDF file."""
        try:
            # Validate file
            is_valid, message = self.validate_pdf(file_path)
            if not is_valid:
                return {
                    'success': False,
                    'error': message,
                    'text': '',
                    'metadata': {}
                }
            
            # Extract metadata
            metadata = self.extract_metadata(file_path)
            
            # Try PyMuPDF first
            text = self.extract_text_pymupdf(file_path)
            
            # If PyMuPDF fails, try pdfplumber
            if not text or len(text.strip()) < 100:
                logger.info("PyMuPDF extraction insufficient, trying pdfplumber")
                text = self.extract_text_pdfplumber(file_path)
            
            if not text or len(text.strip()) < 50:
                return {
                    'success': False,
                    'error': 'Could not extract sufficient text from PDF',
                    'text': '',
                    'metadata': metadata
                }
            
            # Clean extracted text
            cleaned_text = self.clean_text(text)
            
            return {
                'success': True,
                'text': cleaned_text,
                'metadata': metadata,
                'word_count': len(cleaned_text.split()),
                'char_count': len(cleaned_text)
            }
        
        except Exception as e:
            logger.error(f"PDF processing error: {str(e)}")
            return {
                'success': False,
                'error': f'Processing error: {str(e)}',
                'text': '',
                'metadata': {}
            }

# Global instance
pdf_processor = PDFProcessor()