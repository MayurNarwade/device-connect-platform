import hmac
import hashlib
import time
import base64
from ..core.config import TURN_SHARED_SECRET, TURN_SERVER_URLS

def generate_turn_credentials():
    timestamp = int(time.time()) + 3600  # 1 hour
    username = f"{timestamp}:aetherlink"
    # credential = base64(hmac-sha1(secret, username))
    credential = base64.b64encode(
        hmac.new(TURN_SHARED_SECRET.encode(), username.encode(), hashlib.sha1).digest()
    ).decode()
    return {
        "username": username,
        "credential": credential,
        "ttl": 3600,
        "urls": TURN_SERVER_URLS
    }