from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from app.schemas import WebSocketMessage

class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections by room_id
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Dictionary to store user info for each connection
        self.connection_info: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, room_id: int, user_id: int, username: str):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        
        self.active_connections[room_id].append(websocket)
        self.connection_info[websocket] = {
            "user_id": user_id,
            "username": username,
            "room_id": room_id
        }
        
        # Notify others in the room that user joined
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "username": username,
            "user_id": user_id
        }, exclude_websocket=websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connection_info:
            room_id = self.connection_info[websocket]["room_id"]
            username = self.connection_info[websocket]["username"]
            user_id = self.connection_info[websocket]["user_id"]
            
            if room_id in self.active_connections:
                self.active_connections[room_id].remove(websocket)
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
            
            del self.connection_info[websocket]
            
            # Notify others in the room that user left
            asyncio.create_task(self.broadcast_to_room(room_id, {
                "type": "user_left",
                "username": username,
                "user_id": user_id
            }))

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, room_id: int, message: dict, exclude_websocket: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude_websocket:
                    try:
                        await connection.send_text(json.dumps(message))
                    except:
                        # Remove dead connections
                        self.disconnect(connection)

    async def broadcast_message(self, room_id: int, message: dict):
        await self.broadcast_to_room(room_id, message)

    def get_room_users(self, room_id: int) -> List[dict]:
        if room_id not in self.active_connections:
            return []
        
        users = []
        for websocket in self.active_connections[room_id]:
            if websocket in self.connection_info:
                users.append({
                    "user_id": self.connection_info[websocket]["user_id"],
                    "username": self.connection_info[websocket]["username"]
                })
        return users

manager = ConnectionManager()
