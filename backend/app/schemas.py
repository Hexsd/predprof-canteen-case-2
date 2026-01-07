from pydantic import BaseModel, EmailStr
from datetime import date
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    birth_date: date
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    name: str
    birth_date: date
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
class TokenData(BaseModel):
    email: str | None = None



class Menu(BaseModel):
    id: int
    date: date
    breakfast: str
    given_breakfasts: int
    lunch: str
    given_lunches: int
    class Config:
        from_attributes = True

class MenuCreate(BaseModel):
    date: date
    breakfast: str
    lunch: str