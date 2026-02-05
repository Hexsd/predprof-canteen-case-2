from fastapi import APIRouter, WebSocket, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Dict, Set
import json
import threading
from .. import models, auth
from ..database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["websocket"])

active_connections: Dict[int, Set[WebSocket]] = {}

async def get_user_from_token(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить данные",
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    try:
        user = await get_user_from_token(token, db)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return
    
    await websocket.accept()
    
    if user.id not in active_connections:
        active_connections[user.id] = set()
    
    active_connections[user.id].add(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
    except Exception:
        active_connections[user.id].discard(websocket)
        if not active_connections[user.id]:
            del active_connections[user.id]

def send_notification(user_id: int, message: str, notification_type: str = "info"):
    if user_id in active_connections:
        connections = list(active_connections[user_id])
        
        async def send_to_client(websocket: WebSocket):
            try:
                await websocket.send_json({
                    "message": message,
                    "type": notification_type
                })
            except Exception as e:
                logger.exception("Error sending notification: %s", e)
                if user_id in active_connections:
                    active_connections[user_id].discard(websocket)
        
        import asyncio
        for connection in connections:
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(send_to_client(connection))
                loop.close()
            except Exception as e:
                logger.exception("Error in send_notification: %s", e)
