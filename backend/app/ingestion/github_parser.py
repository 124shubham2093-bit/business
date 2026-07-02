import requests

class GitHubParser:
    @staticmethod
    def extract_repo_info(repo_url: str) -> str:
        if not repo_url or "github.com" not in repo_url:
            return f"Invalid or missing GitHub URL: {repo_url}"
        
        try:
            parts = repo_url.rstrip("/").split("github.com/")
            if len(parts) < 2:
                return "Could not parse GitHub repo path."
            path = parts[1]
            
            # Call Github Public API
            api_url = f"https://api.github.com/repos/{path}"
            res = requests.get(api_url, timeout=5)
            if res.status_code != 200:
                return f"GitHub API returned status {res.status_code} for repo path {path}"
                
            data = res.json()
            description = data.get("description", "No description available")
            stars = data.get("stargazers_count", 0)
            forks = data.get("forks_count", 0)
            language = data.get("language", "Unknown")
            topics = ", ".join(data.get("topics", []))
            
            # Attempt to fetch README
            readme_url = f"https://api.github.com/repos/{path}/readme"
            readme_res = requests.get(readme_url, timeout=5)
            readme_text = ""
            if readme_res.status_code == 200:
                readme_data = readme_res.json()
                download_url = readme_data.get("download_url")
                if download_url:
                    text_res = requests.get(download_url, timeout=5)
                    if text_res.status_code == 200:
                        # Grab first 1000 characters to prevent token size issues
                        readme_text = text_res.text[:1000]
            
            return (
                f"Repository: {path}\n"
                f"Description: {description}\n"
                f"Primary Language: {language}\n"
                f"Stars: {stars} | Forks: {forks}\n"
                f"Topics: {topics}\n"
                f"README Summary:\n{readme_text}"
            )
        except Exception as e:
            return f"Error connecting to GitHub API for {repo_url}: {str(e)}"
