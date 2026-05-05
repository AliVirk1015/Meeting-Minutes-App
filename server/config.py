from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    groq_base_url: str = "https://api.groq.com/openai/v1"
    frontend_url: str = "http://localhost:3000"
    upload_dir: str = "uploads"
    max_file_size_mb: int = 5


settings = Settings()
