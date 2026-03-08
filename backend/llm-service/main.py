from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models import (
    ReviewRequest,
    ReviewResponse,
    TestProviderRequest,
    TestProviderResponse,
    OllamaModelsResponse,
    HealthResponse,
    GitHubConfig,
    LLMProvider,
)
from reviewer import Reviewer
from config import Config


# ─────────────────────────────────────────
# LIFESPAN — startup + shutdown
# ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    print("🚀 llm-service starting...")
    print(f"📡 running on port {Config.PORT}")
    print(f"🤖 supported providers: anthropic, openai, groq, gemini, ollama")
    yield
    # shutdown
    print("🔴 llm-service shutting down...")


# ─────────────────────────────────────────
# APP
# ─────────────────────────────────────────

app = FastAPI(
    title="CodexAI LLM Service",
    description="Plug & play LLM provider service for AI code reviews",
    version="1.0.0",
    lifespan=lifespan,
)


# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["health"],
)
async def health():
    return HealthResponse(
        status="ok",
        service="llm-service",
        providers={
            "anthropic": True,
            "openai":    True,
            "groq":      True,
            "gemini":    True,
            "ollama":    True,
        },
    )


# ─────────────────────────────────────────
# REVIEW — plain code
# user pastes code in UI
# ─────────────────────────────────────────

@app.post(
    "/llm/review",
    response_model=ReviewResponse,
    tags=["review"],
)
async def review_code(request: ReviewRequest):
    """
    Review code directly.
    User pastes code in UI → gets review back.
    No GitHub involved.
    """
    try:
        result = await reviewer.review(request)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")


# ─────────────────────────────────────────
# REVIEW — github file
# fetch from GitHub → review → commit back
# ─────────────────────────────────────────

@app.post(
    "/llm/review/github",
    response_model=ReviewResponse,
    tags=["review"],
)
async def review_github(request: ReviewRequest):
    """
    Full GitHub flow:
    fetch file → LLM review → commit fixed code back.
    request must include github_config + github_file.
    """
    try:
        result = await reviewer.review_github_file(request)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub review failed: {str(e)}")


# ─────────────────────────────────────────
# TEST PROVIDER CONNECTION
# user clicks "Test" in settings UI
# ─────────────────────────────────────────

@app.post(
    "/llm/test",
    response_model=TestProviderResponse,
    tags=["settings"],
)
async def test_provider(request: TestProviderRequest):
    """
    Test if LLM provider is reachable.
    Called from settings page — "Test Connection" button.
    """
    success, message = await reviewer.test_provider(request.llm_config)
    return TestProviderResponse(
        success=success,
        message=message,
        model=request.llm_config.model,
    )


# ─────────────────────────────────────────
# OLLAMA — fetch installed models
# user clicks "Fetch Models" in settings UI
# ─────────────────────────────────────────

@app.get(
    "/ollama/models",
    response_model=OllamaModelsResponse,
    tags=["ollama"],
)
async def get_ollama_models(
    url: str = Query(
        default="http://localhost:11434",
        description="Ollama base URL",
    )
):
    """
    Fetch installed Ollama models.
    Called when user clicks "Fetch Models" in UI.
    Returns list of installed models with sizes.
    """
    result = await reviewer.get_ollama_models(url)
    return result


# ─────────────────────────────────────────
# GITHUB — test connection
# user connects GitHub in settings UI
# ─────────────────────────────────────────

@app.post(
    "/github/test",
    response_model=TestProviderResponse,
    tags=["github"],
)
async def test_github(config: GitHubConfig):
    """
    Test GitHub token + repo access.
    Called from settings page — "Connect GitHub" button.
    """
    success, message = await reviewer.test_github(config)
    return TestProviderResponse(
        success=success,
        message=message,
    )


# ─────────────────────────────────────────
# GITHUB — list repo files
# user browses repo file tree in UI
# ─────────────────────────────────────────

@app.get(
    "/github/files",
    tags=["github"],
)
async def list_github_files(
    token:  str = Query(..., description="GitHub token"),
    repo:   str = Query(..., description="username/repo-name"),
    branch: str = Query(default="main", description="branch name"),
    path:   str = Query(default="", description="folder path"),
):
    """
    List files in GitHub repo at given path.
    Used for file picker in UI — user browses repo.

    Example:
        GET /github/files?token=ghp_xxx&repo=user/repo&path=src
    """
    github_config = GitHubConfig(
        token=token,
        repo=repo,
        branch=branch,
    )

    try:
        files = await reviewer.list_github_files(github_config, path)
        return {"files": files, "path": path}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


# ─────────────────────────────────────────
# RUN
# ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=Config.PORT,
        reload=True,
    )