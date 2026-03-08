from abc import ABC, abstractmethod 
from models import ReviewRequest, ReviewResponse, OllamaModelsResponse

class BaseLLMProvider(ABC):
    @abstractmethod
    async def test_connection(self) -> tuple[bool, str]:
        """
        Test if the provider is reachable with given config.
        Returns (success, message)

        success = True  → "Connected to claude-haiku-4-5"
        success = False → "Invalid API key"
        """
        pass
    
    async def get_available_models(self) -> OllamaModelsResponse:
        return OllamaModelsResponse(
            available=False,
            models=[],
            error="Not suported for this provider"
        )

    # shared heler available to all provider 
    def build_prompt(self, code: str, language: str) -> str:
        from config import config 
        return config.REVIEW_PROMPT.format(
            language=language,
            code=code
        )

    def parse_llm_response(self, raw: str) -> ReviewResponse: 
        import json 
        import re 
        from models import Issue, Severity

        try: 
            cleaned: re.sub(r"```json|```", "", raw).strip()

            data = json.loads(cleaned)

            # parse issues 
            issues = []
            for i in data.get("issues", []):
                issues.append(Issue(
                    line=i.get("line", 0),
                    severity=Severity(i.get("severity", "info")),
                    message=i.get("message", ""),
                    detail=i.get("detail", ""),
                ))

            # clamp score between 0 and 10 
            score = float(data.get("score", 5.0))
            score = max(0.0, min(10.0, score))

            return ReviewResponse(
                score=score,
                summary=data.get("summary", ""),
                issues=issues,
                suggestions=data.get("suggestions", []),
                fixed_code=data.get("fixed_code", None),
            )
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            return ReviewResponse(
                score=0.0,
                summary=f"falied to parse review response: {str(e)}",
                issues=[],
                suggestions=["please try again"],
                fixed_code=None,
            )

    def _get_model(self, requested: str | None, provider: str) -> str: 
        from config import config 
        if requested: 
            return requested
        return config.DEFAULT_MODELS.get(provider, "")