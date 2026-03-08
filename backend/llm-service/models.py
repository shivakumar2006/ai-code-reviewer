from pydantic import BaseModel, Field 
from typing import Optional 
from enum import Enum

class Language(str, Enum):
    GO = "go"
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA       = "java"
    RUST       = "rust"
    CPP        = "cpp"
    UNKNOWN    = "unknown"

class Severity(str, Enum):
    BUG      = "bug"
    WARNING  = "warning"
    INFO     = "info"
    SECURITY = "security"


class LLMProvider(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI    = "openai"
    GROQ      = "groq"
    GEMINI    = "gemini"
    OLLAMA    = "ollama"

# ollama model 
class OllamaModelInfo(BaseModel):
    name: str 
    full_name: str 
    size_gb: float 
    modified_at: str 

class OllamaModelsResponse(BaseModel):
    available: bool = False 
    models: list[OllamaModelInfo] = []
    error: Optional[str] = None 

# llm config 
class LLMConfig(BaseModel): 
    provider: LLMProvider 
    api_key: Optional[str] = None # and no api key field for ollama 
    model: Optional[str] = None 
    ollama_url:   str           = "http://localhost:11434"  
    ollama_model: Optional[str] = None

# github config 
class GitHubConfig(BaseModel): 
    token: str 
    repo: str 
    branch: str = "main"

# review request/response 
class Issue(BaseModel): 
    line: int = 0 
    severity: Severity = Severity.INFO
    message: str 
    detail: str = ""

class ReviewRequest(BaseModel): 
    code: str 
    language: Language = Language.UNKNOWN
    llmConfig: LLMConfig

    # optional github
    github_config: Optional[GitHubConfig] = None
    github_file:   Optional[str]          = None

class ReviewResponse(BaseModel): 
    score: float = Field(ge=0, le=10)
    summary: str 
    issues: list[Issue] = []
    suggestions: list[str] = []

    # populated if github commit was made 
    fixed_code: Optional[str] = None 
    commit_url: Optional[str] = None 
    commit_sha: Optional[str] = None 


# provider test 
class TestProviderRequest(BaseModel): 
    llm_config: LLMConfig

class TestProviderResponse(BaseModel): 
    success: bool 
    message: str 
    model: Optional[str] = None 

# health 
class HealthResponse(BaseModel): 
    status: str = "ok"
    service: str = "llm-service"
    providers: dict[str, bool] = {}


