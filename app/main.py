from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import json
import asyncio
import os
from typing import Dict

from app.database import get_db, engine, Base
from app.models import User, Room, Message, RoomMembership
from app.routers import auth, rooms, messages
from app.websocket_manager import manager
from app.auth import get_current_user
from app.schemas import WebSocketMessage

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Real-Time Chat Application",
    description="A modern real-time chat application built with FastAPI, WebSockets, and PostgreSQL",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(messages.router)

# Serve static files (React build)
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Real-Time Chat API", "version": "1.0.0"}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int, token: str = None):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Verify token and get user
    try:
        from app.auth import verify_token, HTTPException
        from app.database import SessionLocal
        
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
        
        token_data = verify_token(token, credentials_exception)
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(User.username == token_data.username).first()
            if not user:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
            
            # Check if user is member of the room
            membership = db.query(RoomMembership).filter(
                RoomMembership.user_id == user.id,
                RoomMembership.room_id == room_id
            ).first()
            
            if not membership:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
            
            # Connect to room
            await manager.connect(websocket, room_id, user.id, user.username)
            
            # Send current room users
            room_users = manager.get_room_users(room_id)
            await manager.send_personal_message(
                json.dumps({
                    "type": "room_users",
                    "users": room_users
                }), 
                websocket
            )
            
            try:
                while True:
                    data = await websocket.receive_text()
                    message_data = json.loads(data)
                    
                    if message_data["type"] == "message":
                        # Save message to database
                        db_message = Message(
                            content=message_data["content"],
                            user_id=user.id,
                            room_id=room_id
                        )
                        db.add(db_message)
                        db.commit()
                        db.refresh(db_message)
                        
                        # Broadcast message to room
                        await manager.broadcast_message(room_id, {
                            "type": "message",
                            "id": db_message.id,
                            "content": db_message.content,
                            "username": user.username,
                            "user_id": user.id,
                            "created_at": db_message.created_at.isoformat()
                        })
                    
                    elif message_data["type"] == "typing":
                        # Broadcast typing indicator
                        await manager.broadcast_to_room(room_id, {
                            "type": "typing",
                            "username": user.username,
                            "is_typing": message_data.get("is_typing", False)
                        }, exclude_websocket=websocket)
                        
            except WebSocketDisconnect:
                manager.disconnect(websocket)
                
        finally:
            db.close()
            
    except Exception as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
