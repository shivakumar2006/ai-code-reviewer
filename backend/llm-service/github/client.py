import httpx
import base64 
from models import GithubConfig

class GithubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self, config: GithubConfig): 
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {config.token}",
                "Accept": "application/vnd.github+json",
                "X-Github-Api-Version": "2022-11-28",
            },
            timeout=30,
        )

    # fetch file 
    async def fetch_file(self, file_path: str) -> tuple[bool, str]: 
        try: 
            response = await self.client.get(
                f"/repos/{self.config.repo}/contents/{file_path}",
                params={"ref": self.config.branch},
            )
            response.raise_for_status()
            data = response.json()

            content = base64.b64decode(data["content"]).decode("utf-8")
            sha = data["sha"]

            return content, sha 

        except httpx.HTTPStatusError as e: 
            if e.response.status_code == 404: 
                raise ValueError(
                    f"File '{file_path}' not found in"
                    f"{self.config.repo}/{self.config.branch}"
                )
            if e.response.status_code == 401:
                raise ValueError("invalid github token")
            if e.response.status_code == 403: 
                raise ValueError(
                    "Github token doesn't have repo access -"
                    "make sure token has 'repo' scope "
                )
            raise ValueError(f"Github api error: {str(e)}")
        
        except Exception as e: 
            raise ValueError(f"failed to fetch file: {str(e)}")

    #commit file 
    async def commit_file(
        self,
        file_path: str,
        fixed_code: str,
        sha: str,
        commit_changes: str | None = None,
    ) -> tuple[bool, str]:

        if not commit_message: 
            commit_message =  f"fix: AI code review applied to {file_path}"

        encoded = base64.b64decode(fixed_code.encode("utf-8")).decode("utf-8")

        try:
            response = await self.client.put(
                f"/repos/{self.config.repo}/contents/{file_path}",
                json={
                    "message": commit_message,
                    "content": encoded,
                    "sha":     sha,           # current file sha
                    "branch":  self.config.branch,
                },
            )
            response.raise_for_status()
            data = response.json()

            commit_sha = data["commit"]["sha"]
            commit_url = data["commit"]["html_url"]

            return commit_url, commit_sha

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise ValueError("Invalid GitHub token")
            if e.response.status_code == 403:
                raise ValueError(
                    "GitHub token doesn't have write access — "
                    "make sure token has 'repo' scope"
                )
            if e.response.status_code == 409:
                raise ValueError(
                    "Conflict — file was modified since last fetch, "
                    "please try again"
                )
            raise ValueError(f"GitHub commit failed: {str(e)}")

        except Exception as e:
            raise ValueError(f"Failed to commit file: {str(e)}")

    
    async def create_pr(
        self,
        title:   str,
        body:    str,
        head:    str,   # branch with changes
        base:    str = "main",
    ) -> str:
        """
        Create a PR with AI review summary as description.
        Returns PR url.
        """
        try:
            response = await self.client.post(
                f"/repos/{self.config.repo}/pulls",
                json={
                    "title": title,
                    "body":  body,
                    "head":  head,
                    "base":  base,
                },
            )
            response.raise_for_status()
            data = response.json()

            return data["html_url"]

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 422:
                raise ValueError(
                    "PR already exists for this branch "
                    "or no commits to compare"
                )
            raise ValueError(f"Failed to create PR: {str(e)}")

        except Exception as e:
            raise ValueError(f"Failed to create PR: {str(e)}")

    
    async def list_files(self, path: str = "") -> list[dict]:
        """
        List files and folders in repo at given path.
        Used in UI file picker — user browses repo
        and picks file to review.
        Returns list of {name, path, type} dicts.
        type = "file" or "dir"
        """
        try:
            response = await self.client.get(
                f"/repos/{self.config.repo}/contents/{path}",
                params={"ref": self.config.branch},
            )
            response.raise_for_status()
            items = response.json()

            return [
                {
                    "name": item["name"],
                    "path": item["path"],
                    "type": item["type"],   # "file" or "dir"
                    "size": item.get("size", 0),
                }
                for item in items
                # filter out hidden files and common noise
                if not item["name"].startswith(".")
                and item["name"] not in ["node_modules", "vendor", "__pycache__"]
            ]

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(
                    f"Path '{path}' not found in {self.config.repo}"
                )
            raise ValueError(f"GitHub API error: {str(e)}")

        except Exception as e:
            raise ValueError(f"Failed to list files: {str(e)}")

    
    async def test_connection(self) -> tuple[bool, str]:
        """
        Verify GitHub token + repo access.
        Called when user clicks "Connect GitHub" in UI.
        """
        try:
            response = await self.client.get(
                f"/repos/{self.config.repo}"
            )
            response.raise_for_status()
            data = response.json()

            # check if we have push access
            can_push = data.get("permissions", {}).get("push", False)
            if not can_push:
                return False, (
                    f"Connected to {self.config.repo} but no write access — "
                    "token needs 'repo' scope for commits"
                )

            return True, f"Connected to {self.config.repo} ✅"

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                return False, "Invalid GitHub token"
            if e.response.status_code == 404:
                return False, (
                    f"Repo '{self.config.repo}' not found — "
                    "check repo name format: 'username/repo'"
                )
            return False, f"GitHub error: {str(e)}"

        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    async def close(self):
        await self.client.aclose()