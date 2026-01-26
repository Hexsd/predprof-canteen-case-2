import enum
from sqlalchemy import Column, Integer, String, Date, Enum
from .database import Base

class UserRole(str, enum.Enum):
    student="student"
    cook="cook"
    admin="admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    birth_date = Column(Date)
    role=Column(Enum(UserRole), default=UserRole.student)


class Menu(Base):
    __tablename__ = "menu"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    breakfast = Column(String)
    given_breakfasts = Column(Integer, default=0)
    lunch = Column(String)
    given_lunches = Column(Integer, default=0)


class Dish(Base):
    __tablename__ = "dish"

    id = Column(Integer, primary_key=True, index=True)
    products = Column(String)
    amount = Column(Integer, default=1)
    name = Column(String, unique=True)

class Product(Base):
    __tablename__ = "product"

    id = Column(Integer, primary_key=True, index=True)
    alergens = Column(String)
    amount = Column(Integer, default=1)
    name = Column(String, unique=True)

class Alergen(Base):
    __tablename__ = "alergen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)