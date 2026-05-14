from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from ..core.security import decode_session_token
import json
import logging

logger = logging.getLogger("aetherlink.signaling")

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # session_id -> { device_id: websocket }
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, session_id: str, device_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
        self.active_connections[session_id][device_id] = websocket

    def disconnect(self, session_id: str, device_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].pop(device_id, None)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def send_to_other(self, session_id: str, sender_device_id: str, message: dict):
        if session_id in self.active_connections:
            for dev_id, ws in self.active_connections[session_id].items():
                if dev_id != sender_device_id:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass   # client may have disconnected

manager = ConnectionManager()

@router.websocket("/ws/signal")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = decode_session_token(token)
        session_id = payload["session_id"]
        device_id = payload["device_id"]
    except Exception:
        await websocket.close(code=4001)
        return

    await manager.connect(session_id, device_id, websocket)

    try:
        while True:
            raw = await websocket.receive_json()

            # Heartbeat
            if raw.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            # On join, notify the other peer
            if raw.get("type") == "join":
                await manager.send_to_other(session_id, device_id, {
                    "type": "device_joined",
                    "payload": raw.get("payload", {})
                })
                continue

            # Forward everything else (offer, answer, ice_candidate) to the other client
            await manager.send_to_other(session_id, device_id, raw)

    except WebSocketDisconnect:
        manager.disconnect(session_id, device_id)
        # Optionally notify the other client about disconnect
        await manager.send_to_other(session_id, device_id, {"type": "peer_disconnected"})