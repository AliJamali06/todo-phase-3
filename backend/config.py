import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "")
BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Phase 3: AI Chatbot
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
