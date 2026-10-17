"""
OpenAI Service for ABI Inspection
Uses:
  - Local Whisper (openai-whisper) for FREE on-device audio transcription
  - OpenAI GPT for LLM operations (transcript summary, defect extraction)
  - Local filesystem for file storage
  - SQLite for audit records
"""
import os
import io
import json
import tempfile
import uuid
import logging
import shutil
from pathlib import Path
from datetime import datetime
from typing import BinaryIO, Optional

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OpenAIService:
    """Service class for OpenAI-powered operations"""

    def __init__(self):
        """Initialize OpenAI client, model config, and local file storage"""
        try:
            from openai import OpenAI
        except ImportError:
            raise RuntimeError(
                "openai package is not installed. Run: pip install openai"
            )

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY environment variable is not set. "
                "Get your API key from https://platform.openai.com/api-keys"
            )

        self.client = OpenAI(api_key=api_key)

        # ── Model configuration (read from env after dotenv is loaded) ────────
        # Change these in backend/.env — no code edits required.
        self.AI_MODELS = {
            # GPT model for transcript summarisation
            "summary":    os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            # Same model for structured data extraction
            "extraction": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        }
        # Local Whisper model — runs on-device, FREE (no API cost)
        # Options: tiny | base | small | medium | large | large-v2 | large-v3
        self.WHISPER_MODEL = os.getenv("WHISPER_LOCAL_MODEL", "base")

        # Local file storage directory
        self.storage_dir = Path(
            os.getenv("LOCAL_STORAGE_DIR", str(Path(__file__).parent.parent / "local_data" / "uploads"))
        )
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        self.stage_name = "LOCAL_STORAGE"  # Compatibility attribute

        # Initialize SQLite database
        from api.sqlite_service import init_db
        init_db()

        pass  # Do not log uploaded content or personal data.
        pass  # Do not log uploaded content or personal data.

    # ------------------------------------------------------------------
    # Session management (no-ops for local mode)
    # ------------------------------------------------------------------

    @property
    def AI_MODEL(self):
        """Backward-compat shortcut — returns the summary/extraction model name."""
        return self.AI_MODELS["summary"]

    def ensure_session(self, force: bool = False):
        """No-op for local mode — no session to manage."""
        pass

    def test_connection(self) -> bool:
        """Test OpenAI API connectivity"""
        try:
            self.client.models.list()
            return True
        except Exception as e:
            logger.error(f"OpenAI connection test failed: {e}")
            return False

    # ------------------------------------------------------------------
    # File storage (local filesystem)
    # ------------------------------------------------------------------

    def upload_to_stage(self, file_data: BinaryIO, filename: str, file_type: str = "audio") -> str:
        """
        Save file to local storage directory.

        Args:
            file_data: File binary data
            filename: Original filename
            file_type: Type of file (audio/image)

        Returns:
            Storage filename (unique)
        """
        try:
            unique_id = str(uuid.uuid4())[:8]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

            safe_filename = "".join(
                c for c in filename if c.isalnum() or c in "._- "
            ).strip()
            if not safe_filename:
                safe_filename = f"{file_type}.dat"

            storage_filename = f"{timestamp}_{unique_id}_{safe_filename}"
            dest_path = self.storage_dir / storage_filename

            content = file_data.read()
            if len(content) == 0:
                raise Exception(f"File {filename} is empty (0 bytes)")

            dest_path.write_bytes(content)
            logger.info(f"Saved {len(content)} bytes to {dest_path}")
            return storage_filename

        except Exception as e:
            logger.error(f"Failed to save file locally: {e}")
            raise

    def _storage_path(self, filename: str) -> Path:
        root = self.storage_dir.resolve()
        target = (root / filename).resolve()
        if target == root or not target.is_relative_to(root):
            raise ValueError('File path must stay inside the upload directory.')
        return target

    def get_file_from_stage(self, stage_filename: str) -> bytes:
        """Read file from local storage"""
        file_path = self._storage_path(stage_filename)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found in local storage: {stage_filename}")
        return file_path.read_bytes()

    def get_stage_file_url(self, stage_filename: str) -> Optional[str]:
        """Not applicable for local storage — returns None."""
        return None

    def cleanup_stage_files(self, filenames: list):
        """Delete files from local storage"""
        if not filenames:
            return
        for filename in filenames:
            if not filename:
                continue
            try:
                file_path = self._storage_path(filename)
                if file_path.exists():
                    file_path.unlink()
                    logger.info(f"✅ Deleted local file: {filename}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to delete {filename}: {e}")

    # ------------------------------------------------------------------
    # Audio transcription (local Whisper — free, on-device)
    # ------------------------------------------------------------------

    def transcribe_audio(self, stage_filename: str) -> str:
        """
        Transcribe audio using local Whisper (openai-whisper package).
        Runs entirely on-device — no API key or internet required for transcription.

        Model is loaded once per process and cached.  The model file is downloaded
        from HuggingFace on first use and stored in ~/.cache/whisper.

        Args:
            stage_filename: Filename in local storage

        Returns:
            Transcript text
        """
        try:
            import whisper
        except ImportError:
            raise RuntimeError(
                "openai-whisper is not installed. Run: pip install openai-whisper"
            )

        try:
            file_path = self._storage_path(stage_filename)
            if not file_path.exists():
                raise FileNotFoundError(f"Audio file not found: {stage_filename}")

            model_name = self.WHISPER_MODEL
            logger.info(f"Transcribing audio via local Whisper ({model_name}): {stage_filename}")

            # Load model — whisper caches it after first load
            model = whisper.load_model(model_name)

            result = model.transcribe(
                str(file_path),
                fp16=False,        # fp16 requires CUDA; safe default for CPU
                verbose=False,
            )

            transcript_text = (result.get("text") or "").strip()
            audio_duration   = result.get("duration", 0) or 0

            logger.info(
                f"Whisper transcription complete: duration={audio_duration:.1f}s, "
                f"text_length={len(transcript_text)}"
            )

            # Hallucination guard — local Whisper can hallucinate on silence/noise
            hallucination_patterns = [
                "I'M GOING TO TELL YOU",
                "THANK YOU FOR WATCHING",
                "PLEASE SUBSCRIBE",
                "DON'T FORGET TO LIKE",
                "LIKE AND SUBSCRIBE",
                "IN THIS VIDEO",
                "HEY GUYS",
                "WELCOME BACK",
                "THANKS FOR WATCHING",
                "SEE YOU NEXT TIME",
                "BYE BYE",
            ]

            transcript_upper = transcript_text.upper().strip()
            for pattern in hallucination_patterns:
                if transcript_upper == pattern or transcript_upper == pattern + ".":
                    raise Exception(
                        f"Whisper returned a hallucinated phrase: '{transcript_text}'. "
                        f"This usually means the audio was silent or corrupted. "
                        f"Audio duration: {audio_duration:.1f}s. "
                        f"Please re-record with better audio quality."
                    )

            if audio_duration and audio_duration < 1.0 and len(transcript_text) > 50:
                raise Exception(
                    f"Audio metadata mismatch: duration={audio_duration:.1f}s but "
                    f"transcript is {len(transcript_text)} chars — possible corruption."
                )

            return transcript_text

        except Exception as e:
            logger.error(f"Local Whisper transcription failed: {e}")
            raise

    # ------------------------------------------------------------------
    # LLM operations (OpenAI Chat Completions)
    # ------------------------------------------------------------------

    def _chat_complete(self, messages: list, model: str = None, max_tokens: int = 2048) -> str:
        """
        Internal helper for OpenAI chat completions.

        Args:
            messages: List of message dicts (role/content)
            model: Model name override
            max_tokens: Max response tokens (kept low to control costs)

        Returns:
            Response text
        """
        model = model or self.AI_MODELS["summary"]
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.1,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI chat completion failed: {e}")
            raise

    def summarize_transcript(self, transcript: str) -> dict:
        """
        Summarize transcript using OpenAI GPT.

        Args:
            transcript: Transcript text

        Returns:
            Dict with structured inspection data
        """
        try:
            # Load defect codes
            defect_codes_list = []
            try:
                codes_file = Path(__file__).parent.parent / "codes" / "defect_codes_simplified.json"
                if codes_file.exists():
                    with open(codes_file, "r") as f:
                        defect_codes_data = json.load(f)
                    defect_codes_list = [
                        f"{item['code']}: [{item['category']}] {item['subcategory']} - {item['description']}"
                        for item in defect_codes_data
                    ]
                    logger.info(f"Loaded {len(defect_codes_list)} defect codes for AI prompt")
            except Exception as e:
                logger.warning(f"Could not load defect codes: {e}")

            defect_codes_ref = "\n".join(defect_codes_list) if defect_codes_list else "Use only the supplied synthetic demonstration categories; otherwise UNKNOWN"

            prompt = f"""You are a professional field reviewer producing an ABI (Multimodal Report Studio) report.

CRITICAL: Read the transcript and COUNT how many separate defects are mentioned BEFORE you start mapping them to codes. Each distinct issue must have its own entry.

Read the inspection transcript and map EVERY defect to an synthetic demonstration defect code from the library below. Respond with structured JSON in the EXACT format:

{{
    "defects": [
        {{
            "defect_code": "Synthetic code from the library (e.g., DEMO-001)",
            "category": "Category from the library (e.g., Site Drainage)",
            "subcategory": "Subcategory from the library",
            "code_description": "Description text supplied in the library",
            "defect_found": "Plain-language summary of what was observed",
            "non_compliance": "Observation requiring reviewer confirmation",
            "standard": "User-supplied reference only; otherwise Not assessed",
            "evidence_quote": "Short quote from the transcript that proves the issue"
        }}
    ]
}}

SYNTHETIC EXAMPLE CATEGORY LIBRARY (use ONLY these codes; copy category/subcategory/description EXACTLY):
{defect_codes_ref}

SELECTION RULES:
1. Read the transcript carefully and identify EVERY SINGLE distinct defect mentioned - do not skip any.
2. Each separate issue, non-compliance, or defect observation must be listed as its own entry.
3. For each defect, choose the SINGLE code whose category + subcategory best matches the described issue.
4. Never invent, approximate, or use legacy audit codes (D1, AL2, etc.). Only choose from the library above.
5. If no supplied demonstration category matches, use UNKNOWN and request human review.
6. Include the exact code description from the library so auditors can see the example wording.
7. Provide a one-sentence "defect_found" summary and a separate "non_compliance" explanation referencing performance requirements.
8. Cite ONLY the applicable Australian Standard number (no clause numbers).
9. Include an "evidence_quote"—a short phrase pulled verbatim from the transcript supporting your finding.
10. Return STRICT JSON. Do not wrap it in markdown or add commentary.
11. IMPORTANT: If the transcript mentions 5 defects, your response must contain 5 separate defect entries.

Transcript:
{transcript}

Respond with ONLY the JSON structure shown above."""

            response_text = self._chat_complete(
                [{"role": "user", "content": prompt}],
                model=self.AI_MODELS["summary"],
                max_tokens=2048,
            )

            # Parse JSON response — clean markdown fences if present
            return self._parse_json_response(response_text)

        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            return {
                "defects": [
                    {
                        "title": "Processing Error",
                        "description": f"Failed to analyze transcript: {str(e)}",
                        "standard": "N/A",
                        "clause": "N/A",
                        "requirement": "N/A",
                    }
                ],
                "safety_concerns": [],
                "recommended_actions": [
                    {
                        "action": "Review Required",
                        "details": "Manual review of inspection transcript needed",
                        "standard": "N/A",
                        "clause": "N/A",
                    }
                ],
                "conclusion": "Inspection analysis could not be completed due to processing error.",
            }

    def ai_complete(self, prompt: str, model: str = "summary", max_tokens: int = 2048) -> str:
        """
        Generic AI completion using OpenAI Chat Completions.

        Args:
            prompt: The prompt text
            model: Model key from AI_MODELS dict
            max_tokens: Maximum tokens

        Returns:
            String response
        """
        try:
            model_name = self.AI_MODELS.get(model, self.AI_MODELS["summary"])
            return self._chat_complete(
                [{"role": "user", "content": prompt}],
                model=model_name,
                max_tokens=max_tokens,
            )
        except Exception as e:
            logger.error(f"AI completion failed: {e}")
            return ""

    # ------------------------------------------------------------------
    # Audit records (SQLite)
    # ------------------------------------------------------------------

    def insert_audit_record(
        self, inspection_data: dict, structured_summary: dict, audio_duration: float = None
    ) -> Optional[str]:
        """Insert inspection audit record into SQLite."""
        from api.sqlite_service import insert_audit_record as sqlite_insert

        return sqlite_insert(inspection_data, structured_summary, audio_duration)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_json_response(text: str) -> dict | list:
        """Parse a JSON response from AI, stripping markdown fences and preamble."""
        original = text
        text = text.strip()

        # Remove common preamble
        for prefix in [
            "Here is the structured JSON response:",
            "Here is the JSON response:",
            "Here's the structured JSON:",
            "Here's the JSON:",
            "Here is the response:",
            "Here's the response:",
        ]:
            if text.startswith(prefix):
                text = text[len(prefix) :].strip()

        # Remove markdown code fences
        if text.startswith("```json"):
            text = text[7:].strip()
        elif text.startswith("```"):
            text = text[3:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()

        # Find JSON boundaries
        if not text.startswith("{") and not text.startswith("["):
            json_start = min(
                (text.find("{") if text.find("{") != -1 else len(text)),
                (text.find("[") if text.find("[") != -1 else len(text)),
            )
            if json_start < len(text):
                text = text[json_start:]

        if not text.endswith("}") and not text.endswith("]"):
            json_end = max(text.rfind("}"), text.rfind("]"))
            if json_end != -1:
                text = text[: json_end + 1]

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI JSON: {e}")
            logger.error(f"Original: {original[:300]}...")
            logger.error(f"Cleaned: {text[:300]}...")
            return {
                "defects": [
                    {
                        "title": "Analysis Error",
                        "description": "Failed to parse inspection analysis",
                        "standard": "N/A",
                    }
                ],
                "conclusion": "Manual review required.",
            }
