from typing import Any
import logging

logger = logging.getLogger("aetherlink.signaling")

class SignalingEventHandler:
    """
    Handles and validates incoming WebSocket signaling messages before forwarding.
    Can be extended to add logging, rate‑limiting, content filtering, etc.
    """

    ALLOWED_TYPES = {"offer", "answer", "ice_candidate", "ping", "join", "leave"}

    def __init__(self, session_id: str, device_id: str):
        self.session_id = session_id
        self.device_id = device_id

    async def handle(self, raw_message: dict[str, Any]) -> dict[str, Any] | None:
        """
        Validate and transform an incoming message. Returns the message to be forwarded,
        or None if it should be dropped.
        """
        msg_type = raw_message.get("type")
        if msg_type not in self.ALLOWED_TYPES:
            logger.warning(
                "Unsupported message type '%s' from device %s in session %s",
                msg_type, self.device_id, self.session_id
            )
            return None

        # Add origin metadata if required by the other side
        raw_message["from"] = self.device_id

        # Basic sanitisation for ICE candidates
        if msg_type == "ice_candidate":
            candidate = raw_message.get("payload", {})
            if not candidate or not candidate.get("candidate"):
                logger.info("Empty ICE candidate ignored")
                return None

        return raw_message