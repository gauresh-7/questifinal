from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    display_name = Column(String)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
