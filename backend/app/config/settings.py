from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    OPENAI_API_KEY: str = "mock"
    COGNEE_API_KEY: str = "mock"
    API_MODE: str = "mock"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Support reading .env locally when started from backend/
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
