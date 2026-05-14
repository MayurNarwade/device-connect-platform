import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
TURN_SHARED_SECRET = os.getenv("TURN_SHARED_SECRET", "turn-secret")
TURN_SERVER_URLS = os.getenv("TURN_SERVER_URLS", "turn:localhost:3478").split(",")
OTP_TTL_SECONDS = 120
SESSION_TTL_SECONDS = 600