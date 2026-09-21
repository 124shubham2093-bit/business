import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    OPENAI_API_KEY: str = "mock"
    COGNEE_API_KEY: str = "mock"
    API_MODE: str = "mock"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    COGNEE_DB_PATH: Optional[str] = None

    def get_cognee_db_path(self) -> str:
        if self.COGNEE_DB_PATH and os.path.exists(self.COGNEE_DB_PATH):
            return self.COGNEE_DB_PATH
        env_val = os.environ.get("COGNEE_DB_PATH")
        if env_val and os.path.exists(env_val):
            return env_val
        try:
            import cognee
            cognee_dir = os.path.dirname(cognee.__file__)
            candidate = os.path.join(cognee_dir, ".cognee_system", "databases", "cognee_db")
            return candidate
        except Exception:
            pass
        return os.path.join(os.path.dirname(__file__), "..", "..", ".cognee_system", "databases", "cognee_db")

    # Support reading .env locally when started from backend/
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

