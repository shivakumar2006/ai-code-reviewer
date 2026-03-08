import google.generativeai as genai
from models import ReviewRequest, ReviewResponse
from providers.base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):

    def __init__(self, api_key: str, model: str | None = None):
        self.api_key = api_key
        self.model   = self._get_model(model, "gemini")

        # gemini configures globally — not per client instance
        genai.configure(api_key=api_key)

        self.client = genai.GenerativeModel(
            model_name=self.model,
            # force JSON output
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            ),
            # system instruction
            system_instruction="You are a code reviewer. Always respond with valid JSON only. No markdown, no explanation outside JSON.",
        )

    async def review(self, request: ReviewRequest) -> ReviewResponse:
        prompt = self._build_prompt(
            code=request.code,
            language=request.language.value,
        )

        try:
            response = await self.client.generate_content_async(prompt)

            # gemini returns candidates list
            raw = response.candidates[0].content.parts[0].text
            return self._parse_llm_response(raw)

        except Exception as e:
            error = str(e).lower()

            if "api_key" in error or "authentication" in error:
                raise ValueError("Invalid Gemini API key")

            if "quota" in error or "rate" in error:
                raise ValueError("Gemini quota exceeded — try again later")

            if "safety" in error:
                raise ValueError(
                    "Gemini blocked request due to safety filters — "
                    "try rephrasing or use a different provider"
                )

            raise ValueError(f"Gemini review failed: {str(e)}")


    async def test_connection(self) -> tuple[bool, str]:
        try:
            # gemini test client without JSON mode
            # JSON mode on simple "ok" prompt can cause issues
            test_client = genai.GenerativeModel(
                model_name=self.model,
            )

            response = await test_client.generate_content_async("reply with: ok")

            if response.candidates:
                return True, f"Connected to {self.model}"
            return False, "No response from Gemini"

        except Exception as e:
            error = str(e).lower()
            if "api_key" in error or "authentication" in error:
                return False, "Invalid Gemini API key"
            if "quota" in error:
                return False, "Quota exceeded"
            return False, f"Connection failed: {str(e)}"