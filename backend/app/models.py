from sqlalchemy import Column, Integer, String, Date
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    birth_date = Column(Date)


class Menu(Base):
    __tablename__ = "menu"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    breakfast = Column(String)
    given_breakfasts = Column(Integer, default=0)
    lunch = Column(String)
    given_lunches = Column(Integer, default=0)