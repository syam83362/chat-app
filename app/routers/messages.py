from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Message, RoomMembership, User
from app.schemas import MessageCreate, MessageResponse
from app.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("/room/{room_id}", response_model=List[MessageResponse])
def get_room_messages(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is member of the room
    membership = db.query(RoomMembership).filter(
        RoomMembership.user_id == current_user.id,
        RoomMembership.room_id == room_id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this room"
        )
    
    # Get messages for the room
    messages = db.query(Message).filter(Message.room_id == room_id).order_by(Message.created_at.desc()).limit(50).all()
    return list(reversed(messages))

@router.post("/", response_model=MessageResponse)
def create_message(message: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is member of the room
    membership = db.query(RoomMembership).filter(
        RoomMembership.user_id == current_user.id,
        RoomMembership.room_id == message.room_id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this room"
        )
    
    # Create message
    db_message = Message(
        content=message.content,
        user_id=current_user.id,
        room_id=message.room_id
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message
