from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Room, RoomMembership, User
from app.schemas import RoomCreate, RoomResponse
from app.auth import get_current_user

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("/", response_model=RoomResponse)
def create_room(room: RoomCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_room = Room(
        name=room.name,
        description=room.description,
        is_private=room.is_private,
        created_by=current_user.id
    )
    
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    
    # Add creator as member
    membership = RoomMembership(user_id=current_user.id, room_id=db_room.id)
    db.add(membership)
    db.commit()
    
    return db_room

@router.get("/", response_model=List[RoomResponse])
def get_rooms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get rooms where user is a member
    rooms = db.query(Room).join(RoomMembership).filter(
        RoomMembership.user_id == current_user.id
    ).all()
    return rooms

@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
    
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    return room

@router.post("/{room_id}/join")
def join_room(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if room exists
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check if already a member
    existing_membership = db.query(RoomMembership).filter(
        RoomMembership.user_id == current_user.id,
        RoomMembership.room_id == room_id
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member of this room"
        )
    
    # Add membership
    membership = RoomMembership(user_id=current_user.id, room_id=room_id)
    db.add(membership)
    db.commit()
    
    return {"message": "Successfully joined room"}

@router.delete("/{room_id}/leave")
def leave_room(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(RoomMembership).filter(
        RoomMembership.user_id == current_user.id,
        RoomMembership.room_id == room_id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not a member of this room"
        )
    
    db.delete(membership)
    db.commit()
    
    return {"message": "Successfully left room"}
