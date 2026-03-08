from models import (
    ReviewRequest,
    ReviewResponse,
    OllamaModelsResponse,
    LLMConfig,
    GitHubConfig,
    LLMProvider,
)
from providers import get_provider
from github.client import GitHubClient


class Reviewer:
    """
    Orchestrator — connects everything together.

    Two flows:
        1. Plain review   → just review code, no GitHub
        2. GitHub review  → fetch from GitHub, review, commit back
    """

    # ─────────────────────────────────────────
    # PLAIN REVIEW
    # user pastes code directly in UI
    # ─────────────────────────────────────────

    async def review(self, request: ReviewRequest) -> ReviewResponse:
        """
        Review code directly — no GitHub involved.
        User pastes code in UI → gets review back.
        """
        provider = get_provider(request.llm_config)

        try:
            result = await provider.review(request)
            return result

        except Exception as e:
            raise ValueError(f"Review failed: {str(e)}")

    # ─────────────────────────────────────────
    # GITHUB REVIEW
    # fetch from GitHub → review → commit back
    # ─────────────────────────────────────────

    async def review_github_file(self, request: ReviewRequest) -> ReviewResponse:
        """
        Full GitHub flow:
            1. fetch file from GitHub
            2. review with chosen LLM
            3. commit fixed code back
            4. return review + commit url
        """
        # validate github config present
        if not request.github_config:
            raise ValueError("GitHub config is required for GitHub review")
        if not request.github_file:
            raise ValueError("GitHub file path is required")

        github = GitHubClient(request.github_config)

        try:
            # ── step 1: fetch file ──────────────────
            code, sha = await github.fetch_file(request.github_file)

            # inject fetched code into request
            request.code = code

            # ── step 2: review with LLM ────────────
            provider = get_provider(request.llm_config)
            result   = await provider.review(request)

            # ── step 3: commit if fixed_code exists ─
            if result.fixed_code:
                commit_url, commit_sha = await github.commit_file(
                    file_path=request.github_file,
                    fixed_code=result.fixed_code,
                    sha=sha,
                    commit_message=self._build_commit_message(
                        file=request.github_file,
                        score=result.score,
                        issue_count=len(result.issues),
                    ),
                )
                result.commit_url = commit_url
                result.commit_sha = commit_sha

            return result

        except Exception as e:
            raise ValueError(f"GitHub review failed: {str(e)}")

        finally:
            # always close github client
            await github.close()

    # ─────────────────────────────────────────
    # TEST PROVIDER CONNECTION
    # user clicks "Test" in settings UI
    # ─────────────────────────────────────────

    async def test_provider(self, llm_config: LLMConfig) -> tuple[bool, str]:
        """
        Test if LLM provider is reachable with given config.
        Called from settings page — user clicks "Test Connection"
        """
        try:
            provider = get_provider(llm_config)
            return await provider.test_connection()

        except ValueError as e:
            # config validation failed — missing key etc
            return False, str(e)

        except Exception as e:
            return False, f"Test failed: {str(e)}"

    # ─────────────────────────────────────────
    # TEST GITHUB CONNECTION
    # user clicks "Connect GitHub" in settings UI
    # ─────────────────────────────────────────

    async def test_github(self, github_config: GitHubConfig) -> tuple[bool, str]:
        """
        Test GitHub token + repo access.
        Called from settings page.
        """
        github = GitHubClient(github_config)
        try:
            return await github.test_connection()
        finally:
            await github.close()

    # ─────────────────────────────────────────
    # FETCH OLLAMA MODELS
    # user clicks "Fetch Models" in settings UI
    # ─────────────────────────────────────────

    async def get_ollama_models(self, ollama_url: str) -> OllamaModelsResponse:
        """
        Fetch installed Ollama models.
        Called when user clicks "Fetch Models" in UI.
        """
        from models import LLMConfig, LLMProvider

        # create a temporary ollama config
        # model = "placeholder" because we just want to list models
        # not actually review anything
        temp_config = LLMConfig(
            provider=LLMProvider.OLLAMA,
            ollama_url=ollama_url,
            ollama_model="placeholder",
        )

        try:
            from providers.ollama import OllamaProvider
            provider = OllamaProvider(
                ollama_url=ollama_url,
                model="placeholder",
            )
            return await provider.get_available_models()

        except Exception as e:
            return OllamaModelsResponse(
                available=False,
                models=[],
                error=str(e),
            )

    # ─────────────────────────────────────────
    # LIST GITHUB FILES
    # user browses repo file tree in UI
    # ─────────────────────────────────────────

    async def list_github_files(
        self,
        github_config: GitHubConfig,
        path: str = "",
    ) -> list[dict]:
        """
        List files in GitHub repo at given path.
        Used for file picker in UI.
        """
        github = GitHubClient(github_config)
        try:
            return await github.list_files(path)
        finally:
            await github.close()

    # ─────────────────────────────────────────
    # PRIVATE HELPERS
    # ─────────────────────────────────────────

    def _build_commit_message(
        self,
        file:        str,
        score:       float,
        issue_count: int,
    ) -> str:
        """
        Build a meaningful commit message.

        Examples:
            fix: AI review applied to src/main.go (score: 8.5)
            fix: AI review applied to handler.go (score: 4.2, 3 issues fixed)
        """
        base = f"fix: AI review applied to {file} (score: {score}/10"

        if issue_count > 0:
            base += f", {issue_count} issue{'s' if issue_count > 1 else ''} fixed"

        base += ")"
        return base


# single instance — used across all requests
reviewer = Reviewer()