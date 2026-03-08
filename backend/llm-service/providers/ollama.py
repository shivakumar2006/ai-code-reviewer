import httpx
from models import ReviewRequest, ReviewResponse, OllamaModelsResponse, OllamaModelInfo
from providers.base import BaseLLMProvider
from config import config


class OllamaProvider(BaseLLMProvider):

    def __init__(self, ollama_url: str, model: str):
        # validate model is selected
        if not model:
            raise ValueError(
                "No Ollama model selected — "
                "go to settings and select an installed model"
            )

        self.base_url = ollama_url.rstrip("/")  # remove trailing slash
        self.model    = model
        self.client   = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=config.OLLAMA_TIMEOUT,
        )


    async def review(self, request: ReviewRequest) -> ReviewResponse:
        prompt = self._build_prompt(
            code=request.code,
            language=request.language.value,
        )

        try:
            response = await self.client.post(
                "/api/generate",
                json={
                    "model":  self.model,
                    "prompt": prompt,
                    "stream": False,   # get full response at once
                    "format": "json",  # force JSON output
                    "options": {
                        "temperature": 0.1,  # low temp → consistent output
                        "num_predict": 4096, # max tokens
                    },
                },
            )

            response.raise_for_status()
            data = response.json()

            # ollama returns response in "response" field
            raw = data.get("response", "")
            if not raw:
                raise ValueError("Empty response from Ollama")

            return self._parse_llm_response(raw)

        except httpx.ConnectError:
            raise ValueError(
                f"Cannot connect to Ollama at {self.base_url} — "
                "make sure Ollama is running"
            )

        except httpx.TimeoutException:
            raise ValueError(
                f"Ollama timed out after {config.OLLAMA_TIMEOUT}s — "
                "try a smaller model or increase timeout"
            )

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(
                    f"Model '{self.model}' not found in Ollama — "
                    "pull it first: ollama pull {self.model}"
                )
            raise ValueError(f"Ollama error: {str(e)}")

        except Exception as e:
            raise ValueError(f"Ollama review failed: {str(e)}")


    async def test_connection(self) -> tuple[bool, str]:
        try:
            # ping ollama — just check if it's running
            response = await self.client.get("/api/tags")
            response.raise_for_status()

            data     = response.json()
            models   = data.get("models", [])
            names    = [m.get("name", "") for m in models]

            # check if selected model is actually installed
            model_installed = any(
                self.model in name for name in names
            )

            if not model_installed:
                return False, (
                    f"Ollama is running but '{self.model}' is not installed — "
                    f"run: ollama pull {self.model}"
                )

            return True, f"Connected to Ollama — {self.model} ready"

        except httpx.ConnectError:
            return False, f"Ollama not running at {self.base_url}"

        except Exception as e:
            return False, f"Connection failed: {str(e)}"


    async def get_available_models(self) -> OllamaModelsResponse:
        try:
            response = await self.client.get("/api/tags")
            response.raise_for_status()

            data   = response.json()
            models = data.get("models", [])

            if not models:
                return OllamaModelsResponse(
                    available=True,
                    models=[],
                    error="No models installed — run: ollama pull llama3.2"
                )

            # parse each model
            parsed = []
            for m in models:
                size_bytes = m.get("size", 0)
                size_gb    = round(size_bytes / (1024 ** 3), 1)

                # full name = "llama3.2:latest"
                # name      = "llama3.2"
                full_name = m.get("name", "")
                name      = full_name.split(":")[0]

                parsed.append(OllamaModelInfo(
                    name=name,
                    full_name=full_name,
                    size_gb=size_gb,
                    modified_at=m.get("modified_at", ""),
                ))

            return OllamaModelsResponse(
                available=True,
                models=parsed,
            )

        except httpx.ConnectError:
            return OllamaModelsResponse(
                available=False,
                models=[],
                error=f"Ollama not running at {self.base_url} — start it with: ollama serve"
            )

        except Exception as e:
            return OllamaModelsResponse(
                available=False,
                models=[],
                error=f"Failed to fetch models: {str(e)}"
            )