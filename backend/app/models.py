import enum
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
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
    balance = Column(Integer, default=1000)


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

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    type = Column(String)
    date = Column(Date)
class Alergen(Base):
    __tablename__ = "alergen"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    days = Column(Integer)
    start_date = Column(Date)
    end_date = Column(Date, index=True)


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    list_of_products = Column(String)
    amount_of_products=Column(String)
    price_of_products=Column(String)
    status = Column(String)