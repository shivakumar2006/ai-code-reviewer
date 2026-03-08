from groq import Groq, AuthenticationError, RateLimitError
from models import ReviewRequest, ReviewResponse, OllamaModelsResponse
from providers.base import BaseLLMProvider

class GroqProvider(BaseLLMProvider):

    def __init__(self, api_key: str, model: str | None = None):
        self.api_key = api_key
        self.model = self._get_model(model, "groq")
        self.client = Groq(api_key=api_key)

    #review 

    async def review(self, request: ReviewRequest) -> ReviewResponse: 
        prompt = self._build_prompt(
            code=request.code,
            language=request.language.value
        )

        try: 
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=4096,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": "You are a code reviewer. Always respond with valid JSON only.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            raw = response.choices[0].message.content
            return self._parse_llm_response(raw)

        except AuthenticationError:
            raise ValueError("invalid groq api key")

        except RateLimitError:
            raise ValueError(
                "Groq rate limit exceeded — "
                "free tier allows 6000 tokens/min, try again later"
            )
        
        except Exception as e: 
            raise ValueError(f"Groq review failed: {str(e)}")


    # test connection 
    async def test_connection(self) -> tuple[bool, str]:
        try: 
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=10,
                messages=[
                    {
                        "role": "user",
                        "content": "reply with OK",
                    }
                ]
            )

            if response.choices: 
                return True, f"connected to {self.model} (free tier)"
            return False, "no response from groq"
        
        except AuthenticationError:
            return False, "invalid groq api key"

        except RateLimitError:
            return False, "rate limit exceeded"

        except Exception as e: 
            return False, f"Connection failed: {str(e)}"