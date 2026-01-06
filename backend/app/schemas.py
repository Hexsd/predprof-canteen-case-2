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