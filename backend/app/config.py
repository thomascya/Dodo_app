from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False

    CORS_ORIGINS: list[str] = ["*"]

    EXPO_PUSH_URL: str = "https://exp.host/--/api/v2/push/send"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
