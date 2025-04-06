from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    DB_USER: str = os.getenv("DB_USER")  # Load from env or use default
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT")
    DB_NAME: str = os.getenv("DB_NAME")

    DATABASE_URL: str = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
    PROJECT_NAME: str = "B2B"
    API_VERSION: str = "v1"

    class Config:
        env_file = ".env"

settings = Settings()
print(f"Connecting to DB at {settings.DATABASE_URL}")
