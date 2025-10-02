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
        
        # Academic paper stopwords - common non-meaningful phrases in papers
        self.academic_stopwords = {
            # English - Author/Copyright related
            'corresponding author', 'author name', 'copyright', 'all rights reserved',
            'all authors', 'corresponding', 'author copyright',
            'permission', 'published', 'publisher', 'publication',
            
            # Journal metadata
            'journal', 'issn', 'doi', 'volume', 'issue', 'page', 'pages',
            'abstract', 'keywords', 'introduction', 'conclusion',
            'references', 'bibliography', 'acknowledgment', 'acknowledgement',
            'appendix', 'figure', 'table', 'fig',
            
            # Contact info
            'email', 'phone', 'fax', 'address', 'university', 'department',
            'received', 'accepted', 'revised', 'submitted',
            'et al', 'ibid', 'op cit',
            
            # Indonesian equivalents
            'penulis', 'hak cipta', 'diterima', 'diterbitkan', 'jurnal',
            'abstrak', 'kata kunci', 'pendahuluan', 'kesimpulan', 'daftar pustaka',
            'universitas', 'fakultas', 'email', 'telepon', 'alamat',
            
            # Common software/journal names and categories
            'informatics', 'software engineering', 'and software', 'software',
            'engineering', 'ieee', 'acm', 'springer', 'elsevier', 'wiley',
            
            # Generic common words
            'the', 'and', 'name', 'this', 'that', 'with', 'from',
            'untuk', 'dari', 'dengan', 'yang', 'dan', 'atau',
            
            # Specific issues from your example
            'kuliner', 'solideo', 'solideo kuliner'
        }
        
        # Initialize YAKE keyword extractor for Indonesian and English
        self.yake_extractor = yake.KeywordExtractor(
            lan="id",  # Indonesian language
            n=3,  # n-gram size
            dedupLim=0.9,  # higher deduplication threshold
            top=20,  # extract more, then filter
            features=None,
            stopwords=None
        )
        # Fallback extractor for English documents
        self.yake_extractor_en = yake.KeywordExtractor(
            lan="en",
            n=3,
            dedupLim=0.9,
            top=20,
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

    def _is_valid_keyword(self, keyword: str) -> bool:
        """Check if keyword is valid and meaningful"""
        import re
        
        keyword_lower = keyword.lower().strip()
        
        # Reject if too short or too long
        if len(keyword_lower) < 4 or len(keyword_lower) > 50:
            return False
        
        # Reject if in academic stopwords
        if keyword_lower in self.academic_stopwords:
            return False
        
        # Reject if contains ANY stopword phrase (more aggressive)
        for stopword in self.academic_stopwords:
            if stopword in keyword_lower:
                return False
        
        # Additional specific rejections based on your examples
        specific_rejects = [
            'corresponding', 'author', 'copyright', 'name', 'informatics',
            'software engineering', 'software', 'engineering', 'kuliner',
            'solideo', 'all authors', 'the'
        ]
        
        for reject in specific_rejects:
            if reject in keyword_lower:
                return False
        
        # Reject if mostly numbers or special characters
        alpha_chars = sum(c.isalpha() for c in keyword)
        if alpha_chars < len(keyword) * 0.6:  # More strict
            return False
        
        # Reject if it's all uppercase (likely title/header)
        if keyword.isupper() and len(keyword) > 3:
            return False
        
        # Reject common patterns
        reject_patterns = [
            r'^\d+$',  # Only numbers
            r'^[a-z]{1,2}$',  # Single or two letters
            r'\b(the|and|or|for|of|to|in|on|at|by|with|from|that|this|which)\b',  # Common English
            r'\b(dan|atau|untuk|dari|ke|di|pada|oleh|dengan|yang|ini|itu)\b',  # Common Indonesian
            r'^(fig|figure|table|tabel)\s*\d*$',  # Figure/table references
            r'^section\s*\d*$',  # Section references
            r'@|©|®|™|\|',  # Special symbols
            r'\b(page|pp|vol|issue|doi|issn)\b',  # Journal metadata
            r'^(author|copyright|corresponding|name)\b',  # Specific rejects
        ]
        
        for pattern in reject_patterns:
            if re.search(pattern, keyword_lower):
                return False
        
        # Must contain at least one word with 4+ characters
        words = keyword_lower.split()
        has_substantial_word = any(len(word) >= 4 for word in words)
        if not has_substantial_word:
            return False
        
        return True
    
    def _clean_text_for_keywords(self, text: str) -> str:
        """Clean text specifically for keyword extraction"""
        import re
        
        # Remove common header/footer patterns (more comprehensive)
        patterns_to_remove = [
            # Author and copyright related
            r'(?i)corresponding author[^\n]*',
            r'(?i)author name[^\n]*',
            r'(?i)all authors[^\n]*',
            r'(?i)copyright.*?(\d{4}|all rights)[^\n]*',
            r'(?i)©.*?(\d{4}|all rights)[^\n]*',
            r'(?i)all rights reserved[^\n]*',
            
            # Publishing info
            r'(?i)published by[^\n]*',
            r'(?i)issn[:\s]*[\d-]+[^\n]*',
            r'(?i)doi[:\s]*[\d\.\/\-]+[^\n]*',
            r'(?i)vol\.?\s*\d+[^\n]*',
            r'(?i)pp\.?\s*\d+-\d+[^\n]*',
            r'(?i)page \d+ of \d+[^\n]*',
            
            # Contact info
            r'(?i)e-?mail[:\s]*[^\s]+@[^\s]+[^\n]*',
            r'(?i)received.*?\d{4}[^\n]*',
            r'(?i)accepted.*?\d{4}[^\n]*',
            r'(?i)revised.*?\d{4}[^\n]*',
            
            # Journal names and categories
            r'(?i)\bINFORMATICS AND SOFTWARE\b',
            r'(?i)\bSOFTWARE ENGINEERING\b',
            r'(?i)\bAND SOFTWARE\b',
            
            # Headers/footers
            r'(?i)available online[^\n]*',
            r'(?i)this is an open access[^\n]*',
        ]
        
        cleaned = text
        for pattern in patterns_to_remove:
            cleaned = re.sub(pattern, ' ', cleaned)
        
        # Remove lines that are mostly uppercase (likely headers)
        lines = cleaned.split('\n')
        filtered_lines = []
        for line in lines:
            line_stripped = line.strip()
            if line_stripped:
                upper_count = sum(1 for c in line_stripped if c.isupper())
                if upper_count < len(line_stripped) * 0.7:  # Keep if less than 70% uppercase
                    filtered_lines.append(line)
        
        cleaned = '\n'.join(filtered_lines)
        
        return cleaned

    async def _extract_keywords_with_yake(self, text: str, top_k: int = 30) -> List[Dict[str, Any]]:
        """Extract keywords using YAKE algorithm - returns candidates"""
        try:
            # Clean text from academic artifacts
            cleaned_text = self._clean_text_for_keywords(text)
            cleaned_text = ' '.join(cleaned_text.split())  # Remove extra whitespace
            
            # Create comprehensive stopwords list for YAKE
            custom_stopwords = list(self.academic_stopwords)
            
            # Try Indonesian first, then English as fallback
            extractors_to_try = [
                ("id", "Indonesian"),
                ("en", "English")
            ]
            
            all_keywords = []
            
            for lang_code, lang_name in extractors_to_try:
                try:
                    # Use custom stopwords with YAKE
                    extractor = yake.KeywordExtractor(
                        lan=lang_code,
                        n=2,  # Reduce n-gram size to get more focused keywords
                        dedupLim=0.95,  # Very high deduplication
                        dedupFunc='seqm',  # Use sequence matcher for better dedup
                        windowsSize=1,  # Smaller window for more specific keywords
                        top=top_k,  # Extract candidates
                        features=None,
                        stopwords=custom_stopwords  # Use our custom stopwords
                    )
                    
                    keywords = extractor.extract_keywords(cleaned_text)
                    
                    for keyword_tuple in keywords:
                        try:
                            # YAKE returns (keyword, score) tuples
                            if isinstance(keyword_tuple, tuple) and len(keyword_tuple) == 2:
                                keyword, score = keyword_tuple
                                keyword_str = str(keyword).strip()
                                
                                # Validate keyword
                                if self._is_valid_keyword(keyword_str):
                                    score_float = float(score)
                                    all_keywords.append({
                                        "keyword": keyword_str,
                                        "score": score_float,
                                        "method": f"yake_{lang_code}"
                                    })
                        except (ValueError, TypeError, IndexError) as e:
                            logger.warning(f"Skipping invalid keyword tuple: {keyword_tuple}, error: {e}")
                            continue
                    
                    if all_keywords:
                        logger.info(f"YAKE extracted {len(all_keywords)} valid keywords using {lang_name}")
                        break  # Use first successful extraction
                        
                except Exception as lang_error:
                    logger.warning(f"YAKE failed for {lang_name}: {lang_error}")
                    continue
            
            # Sort by score (lower is better in YAKE)
            if all_keywords:
                all_keywords.sort(key=lambda x: x['score'])
            
            return all_keywords
            
        except Exception as e:
            logger.error(f"YAKE extraction error: {e}")
            return []
    
    async def _refine_keywords_with_llm(self, text: str, yake_keywords: List[Dict[str, Any]], top_k: int = 10) -> List[Dict[str, Any]]:
        """Use LLM to refine and select the most relevant keywords from YAKE candidates"""
        try:
            if not self.groq_client or not yake_keywords:
                return yake_keywords[:top_k]
            
            # Prepare keyword list for LLM
            keyword_list = [kw['keyword'] for kw in yake_keywords[:20]]  # Use top 20 candidates
            
            prompt = f"""Analisis dokumen penelitian ini dan pilih {top_k} kata kunci (keywords) yang PALING RELEVAN dari daftar kandidat berikut.

DOKUMEN (ringkasan):
{text[:2000]}

KANDIDAT KATA KUNCI:
{', '.join(keyword_list)}

INSTRUKSI:
1. Pilih {top_k} kata kunci yang PALING mewakili topik utama, metode, atau kontribusi penelitian
2. HINDARI: nama jurnal, copyright, nama author, metadata
3. PRIORITASKAN: konsep teknis, teknologi, metodologi, domain penelitian
4. Jika kandidat tidak ada yang relevan, berikan kata kunci baru dari dokumen

PENTING: Berikan HANYA dalam format JSON array string, tanpa penjelasan tambahan:
["keyword1", "keyword2", "keyword3", ...]
"""

            response = await self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "Anda adalah ahli analisis dokumen penelitian. Berikan response dalam format JSON array yang valid."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.1,  # Low temperature for consistent results
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse LLM response
            try:
                # Try to parse as JSON object first
                result_obj = json.loads(content)
                
                # Extract keywords array from different possible formats
                if isinstance(result_obj, dict):
                    refined_keywords = result_obj.get('keywords', result_obj.get('kata_kunci', []))
                elif isinstance(result_obj, list):
                    refined_keywords = result_obj
                else:
                    refined_keywords = []
                
                if not refined_keywords:
                    logger.warning("LLM returned empty keywords, using YAKE fallback")
                    return yake_keywords[:top_k]
                
                # Map back to keyword objects with scores
                final_keywords = []
                yake_keyword_map = {kw['keyword'].lower(): kw for kw in yake_keywords}
                
                for idx, keyword in enumerate(refined_keywords[:top_k]):
                    keyword_clean = str(keyword).strip()
                    if keyword_clean and len(keyword_clean) > 2:
                        # Try to find in YAKE results for original score
                        yake_kw = yake_keyword_map.get(keyword_clean.lower())
                        if yake_kw:
                            final_keywords.append({
                                "keyword": keyword_clean,
                                "score": yake_kw['score'],
                                "method": "hybrid_yake_llm",
                                "rank": idx + 1
                            })
                        else:
                            # New keyword from LLM
                            final_keywords.append({
                                "keyword": keyword_clean,
                                "score": 0.01 * (idx + 1),  # Lower score = better
                                "method": "llm_generated",
                                "rank": idx + 1
                            })
                
                logger.info(f"LLM refined keywords: {len(final_keywords)} keywords selected")
                return final_keywords
                
            except json.JSONDecodeError as json_err:
                logger.error(f"Failed to parse LLM JSON response: {json_err}, content: {content}")
                return yake_keywords[:top_k]
                
        except Exception as e:
            logger.error(f"LLM keyword refinement error: {e}")
            # Fallback to YAKE only
            return yake_keywords[:top_k]

    async def extract_keywords(self, text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Hybrid keyword extraction: YAKE + LLM
        1. YAKE extracts candidate keywords (fast, rule-based)
        2. LLM refines and selects most relevant keywords (intelligent, context-aware)
        """
        try:
            # Clean text for YAKE
            if not text or len(text.strip()) < 10:
                return []
            
            # Step 1: Extract candidates with YAKE (30 candidates)
            logger.info("Step 1: Extracting keyword candidates with YAKE...")
            yake_keywords = await self._extract_keywords_with_yake(text, top_k=30)
            
            if not yake_keywords:
                logger.warning("YAKE extraction failed, no keywords found")
                return []
            
            logger.info(f"YAKE found {len(yake_keywords)} candidate keywords")
            
            # Step 2: Refine with LLM if available
            if self.groq_client:
                logger.info("Step 2: Refining keywords with LLM...")
                refined_keywords = await self._refine_keywords_with_llm(text, yake_keywords, top_k)
                
                if refined_keywords:
                    logger.info(f"Hybrid extraction completed: {len(refined_keywords)} final keywords")
                    return refined_keywords
            
            # Fallback: Use YAKE only with deduplication
            logger.info("Using YAKE-only results (LLM not available or failed)")
            final_keywords = []
            seen_keywords = set()
            
            for kw in yake_keywords:
                kw_normalized = kw['keyword'].lower().strip()
                # Check if not already added or very similar
                is_duplicate = False
                for seen in seen_keywords:
                    if kw_normalized in seen or seen in kw_normalized:
                        is_duplicate = True
                        break
                if not is_duplicate:
                    final_keywords.append(kw)
                    seen_keywords.add(kw_normalized)
                    if len(final_keywords) >= top_k:
                        break
            
            return final_keywords[:top_k]
            
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            return []
            
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