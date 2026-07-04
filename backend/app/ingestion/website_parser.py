import requests
from bs4 import BeautifulSoup

class WebsiteParser:
    @staticmethod
    def extract_site_text(url: str) -> str:
        if not url:
            return "No website URL provided."
        
        # Ensure scheme is present
        target_url = url.strip()
        if not target_url.startswith("http"):
            target_url = "https://" + target_url

        try:
            headers = {"User-Agent": "InvestIQ-Bot/1.0"}
            res = requests.get(target_url, headers=headers, timeout=5)
            if res.status_code != 200:
                return f"Failed to access URL, status code: {res.status_code}"
            
            soup = BeautifulSoup(res.text, "html.parser")
            
            # Remove scripts, style, and navigation headers to isolate raw copy text
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()
                
            text = soup.get_text()
            
            # Normalize whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean_text = "\n".join(chunk for chunk in chunks if chunk)
            
            # Limit page size to prevent overloading context windows
            return clean_text[:2000]
        except Exception as e:
            return f"Error parsing website content for {url}: {str(e)}"
