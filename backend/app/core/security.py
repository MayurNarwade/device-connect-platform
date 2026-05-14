import secrets
import time
from jose import jwt
from .config import SECRET_KEY

def generate_otp():
    return str(secrets.randbelow(10**6)).zfill(6)

def create_session_token(session_id: str, device_id: str, ttl: int = 300):
    payload = {
        "session_id": session_id,
        "device_id": device_id,
        "exp": int(time.time()) + ttl
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_session_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])