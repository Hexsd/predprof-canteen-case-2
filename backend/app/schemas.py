from pydantic import BaseModel, EmailStr
from datetime import date
from .models import UserRole, ProductType
from typing import Optional
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    birth_date: date
    role: Optional[UserRole] = UserRole.student
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    name: str
    birth_date: date
    role: UserRole
    class Config:
        from_attributes = True
class UserRoleUpdate(BaseModel):
    role: UserRole

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

class Product(BaseModel):
    id: int
    name: str
    type: Optional[ProductType] = ProductType.product
    amount: int

class ProductCreate(BaseModel):
    name: str
    type: Optional[ProductType] = ProductType.product
    amount: int