from pydantic import BaseModel, EmailStr
from datetime import date
from .models import UserRole
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

class Dish(BaseModel):
    id: int
    products: str
    amount: int
    name: str

class DishCreate(BaseModel):
    products: str
    amount: int
    name: str

class Product(BaseModel):
    id: int
    alergens: str
    amount: int
    name: str

class ProductCreate(BaseModel):
    alergens: str
    amount: int
    name: str

class Alergen(BaseModel):
    id: int
    name: str

class AlergenCreate(BaseModel):
    name: str
    
class UserPersonalPage(BaseModel):
    email: EmailStr
    name: str
