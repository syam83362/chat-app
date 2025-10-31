from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

# Room schemas
class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False

class RoomCreate(RoomBase):
    pass

class RoomResponse(RoomBase):
    id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message schemas
class MessageBase(BaseModel):
    content: str
    room_id: int

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    user_id: int
    created_at: datetime
    user: UserResponse
    
    class Config:
        from_attributes = True

# WebSocket schemas
class WebSocketMessage(BaseModel):
    type: str  # "message", "join", "leave", "typing"
    content: Optional[str] = None
    room_id: Optional[int] = None
    user_id: Optional[int] = None
    username: Optional[str] = None

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
