from models import LLMConfig, LLMProvider
from providers.base import BaseLLMProvider


def get_provider(llm_config: LLMConfig) -> BaseLLMProvider:
    """
    Factory function.
    Takes user's LLM config → returns correct provider instance.

    reviewer.py calls this — doesn't need to know
    which provider is being used.

    Usage:
        provider = get_provider(llm_config)
        result   = await provider.review(request)
    """

    provider = llm_config.provider

    # ─────────────────────────────────────────
    # ANTHROPIC
    # ─────────────────────────────────────────
    if provider == LLMProvider.ANTHROPIC:
        if not llm_config.api_key:
            raise ValueError("Anthropic API key is required")

        from providers.anthropic import AnthropicProvider
        return AnthropicProvider(
            api_key=llm_config.api_key,
            model=llm_config.model,
        )

    # ─────────────────────────────────────────
    # OPENAI
    # ─────────────────────────────────────────
    if provider == LLMProvider.OPENAI:
        if not llm_config.api_key:
            raise ValueError("OpenAI API key is required")

        from providers.openai import OpenAIProvider
        return OpenAIProvider(
            api_key=llm_config.api_key,
            model=llm_config.model,
        )

    # ─────────────────────────────────────────
    # GROQ
    # ─────────────────────────────────────────
    if provider == LLMProvider.GROQ:
        if not llm_config.api_key:
            raise ValueError("Groq API key is required")

        from providers.groq import GroqProvider
        return GroqProvider(
            api_key=llm_config.api_key,
            model=llm_config.model,
        )

    # ─────────────────────────────────────────
    # GEMINI
    # ─────────────────────────────────────────
    if provider == LLMProvider.GEMINI:
        if not llm_config.api_key:
            raise ValueError("Gemini API key is required")

        from providers.gemini import GeminiProvider
        return GeminiProvider(
            api_key=llm_config.api_key,
            model=llm_config.model,
        )

    # ─────────────────────────────────────────
    # OLLAMA
    # ─────────────────────────────────────────
    if provider == LLMProvider.OLLAMA:
        if not llm_config.ollama_url:
            raise ValueError("Ollama URL is required")
        if not llm_config.ollama_model:
            raise ValueError(
                "No Ollama model selected — "
                "go to settings and select an installed model"
            )

        from providers.ollama import OllamaProvider
        return OllamaProvider(
            ollama_url=llm_config.ollama_url,
            model=llm_config.ollama_model,
        )

    # ─────────────────────────────────────────
    # UNKNOWN PROVIDER
    # ─────────────────────────────────────────
    raise ValueError(f"Unknown provider: {provider}")