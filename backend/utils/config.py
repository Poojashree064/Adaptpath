from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    MODEL_PATH: str = "models/adaptpath_xgb_v2.pkl"

    class Config:
        env_file = ".env"

settings = Settings()
