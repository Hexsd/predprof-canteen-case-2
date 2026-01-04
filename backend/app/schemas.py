from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    name: str

class User(UserCreate):
    id: int
    
    class Config:
        from_attributes = True
