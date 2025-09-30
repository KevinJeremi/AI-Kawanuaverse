import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

import yake
import nltk
from groq import AsyncGroq
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize

from app.core.config import settings

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        """Initialize NLP service with Groq client"""
        self.groq_client = None
        
        # Initialize Groq if API key is provided
        if hasattr(settings, 'GROQ_API_KEY') and settings.GROQ_API_KEY:
            self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            logger.info("Groq client initialized")
        else:
            logger.warning("No Groq API key found. Using fallback methods only.")
        
        # Initialize NLTK data
        self._ensure_nltk_data()
        
        # Initialize YAKE keyword extractor for Indonesian and English
        self.yake_extractor = yake.KeywordExtractor(
            lan="id",  # Indonesian language
            n=3,  # n-gram size
            dedupLim=0.7,  # deduplication threshold
            top=10,  # number of keywords to extract
            features=None,
            stopwords=None
        )
        # Fallback extractor for English documents
        self.yake_extractor_en = yake.KeywordExtractor(
            lan="en",
            n=3,
            dedupLim=0.7,
            top=10,
            features=None,
            stopwords=None
        )

    def _ensure_nltk_data(self):
        """Ensure required NLTK data is downloaded"""
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            logger.info("Downloading NLTK punkt tokenizer...")
            nltk.download('punkt', quiet=True)
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            logger.info("Downloading NLTK stopwords...")
            nltk.download('stopwords', quiet=True)

    async def summarize_text(self, text: str, max_length: int = 500) -> Dict[str, Any]:
        """
        Generate summary using LLM API
        """
        try:
            if len(text.split()) < 50:
                return {
                    "summary": text,
                    "bullet_points": [text.strip()],
                    "method": "direct"
                }

            # Use Groq (Llama model) if available
            if self.groq_client:
                return await self._summarize_with_groq(text, max_length)
            else:
                # Fallback to simple extraction if no Groq API key
                logger.info("No Groq client available, using simple summarization")
                return await self._simple_summarization(text, max_length)
                
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return await self._simple_summarization(text, max_length)

    async def _summarize_with_groq(self, text: str, max_length: int) -> Dict[str, Any]:
        """Summarize using Groq Llama API"""
        prompt = f"""
        Analisis dokumen/paper penelitian ini dan berikan dalam bahasa Indonesia:
        1. Ringkasan yang ringkas (maksimal {max_length} kata)
        2. 3-5 poin utama yang menyoroti temuan/wawasan utama

        Teks: {text[:8000]}  # Limit input to avoid token limits

        Format respons Anda sebagai JSON:
        {{
            "summary": "ringkasan dalam bahasa Indonesia",
            "bullet_points": ["poin 1", "poin 2", "poin 3"]
        }}
        """

        response = await self.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Updated to current available model
            messages=[
                {"role": "system", "content": "Anda adalah asisten penelitian yang mengkhususkan diri dalam analisis dokumen. Selalu berikan respons dalam bahasa Indonesia dengan format JSON yang valid."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.3,
            response_format={"type": "json_object"}  # Force JSON response
        )

        try:
            result = json.loads(response.choices[0].message.content)
            return {
                "summary": result.get("summary", ""),
                "bullet_points": result.get("bullet_points", []),
                "method": "groq_llama"
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, extract manually
            content = response.choices[0].message.content
            return {
                "summary": content[:max_length],
                "bullet_points": [content[:200]],
                "method": "groq_llama_fallback"
            }

    async def _simple_summarization(self, text: str, max_length: int) -> Dict[str, Any]:
        """Simple summarization fallback using sentence extraction"""
        sentences = sent_tokenize(text)
        
        # Take first few sentences as summary
        summary_sentences = sentences[:3]
        summary = " ".join(summary_sentences)
        
        # Create bullet points from key sentences
        bullet_points = []
        for i, sentence in enumerate(sentences[:5]):
            if len(sentence.split()) > 10:  # Only longer sentences
                bullet_points.append(sentence.strip())
        
        return {
            "summary": summary[:max_length],
            "bullet_points": bullet_points[:5],
            "method": "simple_extraction"
        }

    async def extract_keywords(self, text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """Extract keywords using YAKE algorithm"""
        try:
            # Clean text for YAKE
            if not text or len(text.strip()) < 10:
                return []
                
            cleaned_text = ' '.join(text.split())  # Remove extra whitespace
            
            # Try Indonesian first, then English as fallback
            extractors_to_try = [
                ("id", "Indonesian"),
                ("en", "English")
            ]
            
            for lang_code, lang_name in extractors_to_try:
                try:
                    extractor = yake.KeywordExtractor(
                        lan=lang_code,
                        n=3,
                        dedupLim=0.7,
                        top=top_k
                    )
                    
                    keywords = extractor.extract_keywords(cleaned_text)
                    
                    result = []
                    for keyword_tuple in keywords:
                        try:
                            # YAKE returns (keyword, score) tuples
                            if isinstance(keyword_tuple, tuple) and len(keyword_tuple) == 2:
                                keyword, score = keyword_tuple
                                score_float = float(score)
                                result.append({
                                    "keyword": str(keyword).strip(),
                                    "score": score_float,
                                    "method": f"yake_{lang_code}"
                                })
                        except (ValueError, TypeError, IndexError) as e:
                            logger.warning(f"Skipping invalid keyword tuple: {keyword_tuple}, error: {e}")
                            continue
                    
                    if result:
                        logger.info(f"YAKE extracted {len(result)} keywords using {lang_name}")
                        return result[:top_k]
                        
                except Exception as lang_error:
                    logger.warning(f"YAKE failed for {lang_name}: {lang_error}")
                    continue
            
            # If both YAKE attempts failed, use simple fallback
            logger.warning("YAKE extraction failed for all languages, using fallback")
            raise Exception("YAKE extraction failed")
            
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            # Simple fallback - most frequent words
            try:
                words = word_tokenize(text.lower())
                stop_words = set(stopwords.words('english'))
                filtered_words = [word for word in words if word.isalpha() and word not in stop_words and len(word) > 3]
                
                # Count word frequency
                word_freq = {}
                for word in filtered_words:
                    word_freq[word] = word_freq.get(word, 0) + 1
                
                # Sort by frequency and return top keywords
                sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
                
                result = []
                for word, freq in sorted_words[:top_k]:
                    result.append({
                        "keyword": word,
                        "score": 1.0 / freq,  # Lower score for higher frequency (YAKE style)
                        "method": "frequency_fallback"
                    })
                
                return result
                
            except Exception as fallback_error:
                logger.error(f"Fallback keyword extraction failed: {fallback_error}")
                return []

    async def answer_question(self, question: str, context: str, conversation_history: List = None) -> Dict[str, Any]:
        """Answer question based on context using LLM API with conversation history"""
        try:
            # Use Groq (Llama model) if available
            if self.groq_client:
                return await self._qa_with_groq(question, context, conversation_history or [])
            else:
                # Simple fallback if no Groq API key
                logger.info("No Groq client available, using simple Q&A")
                return await self._simple_qa(question, context)
                
        except Exception as e:
            logger.error(f"QA error: {e}")
            return await self._simple_qa(question, context)

    async def _qa_with_groq(self, question: str, context: str, conversation_history: List = None) -> Dict[str, Any]:
        """Answer question using Groq Llama API with conversation history"""
        # Build conversation history for context
        history_context = ""
        if conversation_history:
            history_context = "\n\nPercakapan sebelumnya:\n"
            for msg in conversation_history[-6:]:  # Only use last 6 messages to avoid token limit
                role = "Anda" if msg.get("role") == "assistant" else "Pengguna"
                history_context += f"{role}: {msg.get('content', '')}\n"

        # Build messages array with history
        messages = [
            {
                "role": "system", 
                "content": """Anda adalah ResearchMate AI, asisten penelitian yang ramah.

ATURAN PENTING:
- Jawab dengan RINGKAS dan LANGSUNG ke intinya
- Maksimal 2-3 kalimat untuk sapaan/pertanyaan simple
- Hindari pengulangan informasi yang sama
- Jangan sebutkan judul dokumen berulang-ulang
- Gunakan bahasa Indonesia yang natural tapi efisien

PRIORITAS JAWABAN:
1. Jawab pertanyaan langsung dari dokumen
2. Jika tidak ada di dokumen, jawab berdasarkan pengetahuan umum penelitian
3. Untuk sapaan simple seperti "halo" atau "nama saya X", respon singkat dan ramah saja

CONTOH RESPONS BAIK:
- "Halo! Senang bertemu Anda, saya ResearchMate AI. Ada yang bisa saya bantu tentang dokumen ini?"
- "Penulis artikel ini adalah Mariusz Kruk dari University of Zielona Gora, Poland."

HINDARI: Pengulangan informasi, penjelasan panjang untuk pertanyaan simple."""
            }
        ]
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-8:]:  # Limit to last 8 messages
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        # Add current question with context
        current_prompt = f"""Konteks: {context[:3000]}

Pertanyaan: {question}

Jawab RINGKAS dan LANGSUNG. Jangan ulangi informasi yang sudah disebutkan sebelumnya."""

        messages.append({"role": "user", "content": current_prompt})

        response = await self.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=150,  # Reduced to make responses more concise
            temperature=0.1  # Lower temperature for more focused responses
        )

        answer = response.choices[0].message.content.strip()
        
        return {
            "answer": answer,
            "confidence": 0.85,  # High confidence for Groq/Llama
            "context_used": context[:200] + "..." if len(context) > 200 else context,
            "method": "groq_llama"
        }

    async def _simple_qa(self, question: str, context: str) -> Dict[str, Any]:
        """Simple QA fallback using keyword matching"""
        question_words = set(word_tokenize(question.lower()))
        sentences = sent_tokenize(context)
        
        # Find sentences with most question word matches
        best_sentence = ""
        max_matches = 0
        
        for sentence in sentences:
            sentence_words = set(word_tokenize(sentence.lower()))
            matches = len(question_words.intersection(sentence_words))
            if matches > max_matches:
                max_matches = matches
                best_sentence = sentence
        
        if not best_sentence:
            best_sentence = "Saya tidak dapat menemukan informasi ini dalam teks yang diberikan."
        
        return {
            "answer": best_sentence,
            "confidence": 0.3,  # Lower confidence for simple method
            "context_used": best_sentence,
            "method": "keyword_matching"
        }

# Global instance
nlp_service = NLPService()