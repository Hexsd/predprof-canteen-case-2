import enum
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from .database import Base

class UserRole(str, enum.Enum):
    student="student"
    cook="cook"
    admin="admin"

class ProductType(str, enum.Enum):
    meal="meal"
    product="product"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    birth_date = Column(Date)
    role=Column(Enum(UserRole), default=UserRole.student)
    balance = Column(Integer, default=1000)


class Menu(Base):
    __tablename__ = "menu"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    breakfast = Column(String)
    given_breakfasts = Column(Integer, default=0)
    lunch = Column(String)
    given_lunches = Column(Integer, default=0)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    type = Column(Enum(ProductType), default=ProductType.product)
    amount = Column(Integer, default=1)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    type = Column(String)
    date = Column(Date)