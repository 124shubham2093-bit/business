from typing import Dict, Any, Optional
import requests

class GitHubParser:
    @staticmethod
    def extract_repo_info(repo_url: str) -> Dict[str, Any]:
        if not repo_url or "github.com" not in repo_url:
            return {
                "success": False,
                "error": f"Invalid or missing GitHub URL: {repo_url}" if repo_url else "No GitHub URL provided",
                "repo_path": "",
                "description": "",
                "stars": 0,
                "forks": 0,
                "language": "Unknown",
                "topics": [],
                "readme_excerpt": "",
            }
        
        try:
            parts = repo_url.rstrip("/").split("github.com/")
            if len(parts) < 2 or not parts[1].strip():
                return {
                    "success": False,
                    "error": f"Could not parse GitHub repo path from: {repo_url}",
                    "repo_path": "",
                    "description": "",
                    "stars": 0,
                    "forks": 0,
                    "language": "Unknown",
                    "topics": [],
                    "readme_excerpt": "",
                }
            
            # Extract owner/repo cleanly without extra subpaths or queries
            raw_path = parts[1].strip().split("?")[0].split("#")[0]
            path_segments = [seg for seg in raw_path.split("/") if seg]
            if len(path_segments) < 2:
                return {
                    "success": False,
                    "error": f"Incomplete GitHub repository path: '{raw_path}'. Expected format 'owner/repo'.",
                    "repo_path": raw_path,
                    "description": "",
                    "stars": 0,
                    "forks": 0,
                    "language": "Unknown",
                    "topics": [],
                    "readme_excerpt": "",
                }
            path = f"{path_segments[0]}/{path_segments[1]}"
            
            # Call Github Public API
            api_url = f"https://api.github.com/repos/{path}"
            headers = {"User-Agent": "InvestIQ-Diligence-Engine"}
            res = requests.get(api_url, headers=headers, timeout=5)
            if res.status_code == 404:
                return {
                    "success": False,
                    "error": f"Repository Not Found or Not Publicly Accessible (HTTP 404) for '{path}'",
                    "repo_path": path,
                    "description": "",
                    "stars": 0,
                    "forks": 0,
                    "language": "Unknown",
                    "topics": [],
                    "readme_excerpt": "",
                }
            elif res.status_code != 200:
                return {
                    "success": False,
                    "error": f"GitHub API returned HTTP {res.status_code} for '{path}'",
                    "repo_path": path,
                    "description": "",
                    "stars": 0,
                    "forks": 0,
                    "language": "Unknown",
                    "topics": [],
                    "readme_excerpt": "",
                }
                
            data = res.json()
            description = data.get("description") or "No description available"
            stars = int(data.get("stargazers_count", 0))
            forks = int(data.get("forks_count", 0))
            language = data.get("language") or "Unknown"
            topics = data.get("topics", [])
            
            # Attempt to fetch README
            readme_url = f"https://api.github.com/repos/{path}/readme"
            readme_res = requests.get(readme_url, headers=headers, timeout=5)
            readme_text = ""
            if readme_res.status_code == 200:
                readme_data = readme_res.json()
                download_url = readme_data.get("download_url")
                if download_url:
                    text_res = requests.get(download_url, headers=headers, timeout=5)
                    if text_res.status_code == 200:
                        # Grab first 1000 characters to prevent token size issues
                        readme_text = text_res.text[:1000]
            
            return {
                "success": True,
                "error": None,
                "repo_path": path,
                "description": description,
                "stars": stars,
                "forks": forks,
                "language": language,
                "topics": topics,
                "readme_excerpt": readme_text,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error connecting to GitHub API for {repo_url}: {str(e)}",
                "repo_path": "",
                "description": "",
                "stars": 0,
                "forks": 0,
                "language": "Unknown",
                "topics": [],
                "readme_excerpt": "",
            }
