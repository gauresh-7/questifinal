from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth.get_current_user)
):
    user_id = current_user.get("uid")
    db_user = db.query(models.User).filter(models.User.uid == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/", response_model=schemas.UserOut)
def create_user(
    user_in: schemas.UserCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth.get_current_user)
):
    user_id = current_user.get("uid")
    email = current_user.get("email", "")
    
    db_user = db.query(models.User).filter(models.User.uid == user_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
        
    db_user = models.User(
        uid=user_id,
        email=email,
        display_name=user_in.display_name,
        xp=0,
        level=1
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/xp", response_model=schemas.UserOut)
def update_user_xp(
    xp_update: schemas.UserUpdateXP, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth.get_current_user)
):
    user_id = current_user.get("uid")
    db_user = db.query(models.User).filter(models.User.uid == user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.xp = xp_update.xp
    db_user.level = xp_update.level
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Helper to get all users for testing/admin purposes
@router.get("/", response_model=List[schemas.UserOut])
def read_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users
