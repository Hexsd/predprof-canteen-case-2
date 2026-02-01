from pydantic import BaseModel, EmailStr
from datetime import date
from .models import UserRole
from typing import Optional, List
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
    balance: int
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
    given_breakfasts: int
    lunch: str
    given_lunches: int

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

class Payment(BaseModel):
    id: int
    user_id: int
    amount: int
    type: str
    date: date
    class Config:
        from_attributes = True

class ChangeCook(BaseModel):
    dishes: List[Dish]
    products: List[Product]
    alergens: List[Alergen]

class Subscription(BaseModel):
    id: int
    user_id: int
    days: int
    start_date: date
    end_date: date
    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    days: int

class SubscriptionResponse(BaseModel):
    subscription: Optional[Subscription] = None
    is_active: bool
    days_remaining: int


class Application(BaseModel):
    id: int
    date: date
    user_id: int
    list_of_products: str
    amount_of_products: str
    price_of_products: str
    status: str


class ApplicationCreate(BaseModel):
    list_of_products: str
    amount_of_products: str
    price_of_products: str