from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    display_name: str

class UserCreate(UserBase):
    pass

class UserUpdateXP(BaseModel):
    xp: int
    level: int

class UserOut(UserBase):
    uid: str
    email: Optional[str] = None
    xp: int
    level: int

    class Config:
        from_attributes = True
