import anthropic 
from models import ReviewRequest, ReviewResponse, OllamaModelsResponse
from providers.base import BaseLLMProvider
from config import Config

config = Config()

class AnthropicProvider(BaseLLMProvider):

    def __init__(self, api_key: str, model: str | None = None):
        self.api_key = api_key
        self.model = self._get_model(model, "anthropic")
        self.client = anthropic.Anthropic(api_key=api_key)

    # review

    async def review(self, request: ReviewRequest) -> ReviewResponse: 
        prompt = self.build_prompt(
            code=request.code,
            language=request.language.value,
        )

        try: 
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                # force json response 
                system="You are a code reviewer. Always respond with valid JSON only. No markdown, no explanation outside JSON.",
            )

            # extract text from response 
            raw = response.content[0].text
            return self.parse_llm_response(raw)
        
        except anthropic.AuthenticationError:
            raise ValueError("invalid antrophic api key")
        
        except anthropic.RateLimitError:
            raise ValueError("Antropic rate limit exceeded - try again later")
        
        except anthropic.BadRequestError as e:
            raise ValueError(f"Bad request to antropic: {str(e)}")

        except Exception as e: 
            raise ValueError(f"Antropic review failed: {str(e)}")

    # test connection
    async def test_connection(self) -> tuple[bool, str]:
        try: 
            response = self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[
                    {
                        "role": "user",
                        "content": "reply with: OK"
                    }
                ],
            )

            if response.content: 
                return True, f"connected to {self.model}"
            return False, "no response from antropic"
        
        except anthropic.AuthenticationError:
            return False, "invalid antropic api key"
        
        except anthropic.RateLimitError:
            return False, "Rate limit exceeded"

        except Exception as e: 
            return False, f"Connection failed: {str(e)}"