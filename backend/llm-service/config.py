import os 
from dotenv import load_dotenv

load_dotenv()

class Config:
    #server 
    PORT: int = int(os.getenv("PORT", "8082"))

    # CORS 
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
    ]

    DEFAULT_MODELS: dict[str, str] = {
        "anthropic": "claude-haiku-4-5",    # cheapest + fastest claude
        "openai":    "gpt-4o-mini",          # cheapest + fastest gpt
        "groq":      "llama-3.1-70b-versatile", # best free model
        "gemini":    "gemini-1.5-flash",     # cheapest gemini
        "ollama":    None,          
    }

    # single place to update the prompt

    REVIEW_PROMPT: str = """You are an expert code reviewer. Review the following {language} code.

        Provide your response in this EXACT JSON format and nothing else:
        {{
            "score": <float between 0-10>,
            "summary": "<2-3 sentence overall summary>",
            "issues": [
                {{
                    "line": <line number or 0 if general>,
                    "severity": "<bug|warning|info|security>",
                    "message": "<short issue title>",
                    "detail": "<detailed explanation>"
                }}
            ],
            "suggestions": [
                "<actionable suggestion 1>",
                "<actionable suggestion 2>"
            ],
            "fixed_code": "<complete fixed version of the code>"
        }}

        Rules:
        - Score 0-4: serious bugs or security issues
        - Score 5-7: works but needs improvement
        - Score 8-10: clean, production ready code
        - Always include fixed_code with all issues resolved
        - Be specific about line numbers when possible
        - fixed_code must be the complete file, not just the changed parts

        Code to review:
        ````{language}
        {code}
        ```"""

    OLLAMA_TIMEOUT:    int = 120  # ollama is slow locally
    API_TIMEOUT:       int = 60   # cloud APIs are faster
    GITHUB_TIMEOUT:    int = 30   # github api calls