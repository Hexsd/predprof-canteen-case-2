from .database import engine, Base, context_manager
from .models import Menu, User, UserRole, Product, ProductType
from datetime import date
from .auth import hash_password

done = False
with context_manager() as db:
    new_menu = Menu(date=date.today(), breakfast="Блинчики#Чай", lunch="Макароны с котлетой#Суп#Салат греческий#Компот")
    some_product = Product(name="макароны по-флотски", type=ProductType.meal, amount=3)
    db.add(new_menu)
    if not db.query(Product).filter(Product.name == some_product.name).first():
        db.add(some_product)
    admin_user= User(
        email="admin@example.com",
        name="Администратор",
        hashed_password=hash_password("admin"),
        birth_date=date.today(),
        role=UserRole.admin
    )
    cook_user = User(
        email="cook@example.com",
        name="Повар",
        hashed_password=hash_password("cook"),
        birth_date=date.today(),
        role=UserRole.cook
    )
    if not db.query(User).filter(User.email == admin_user.email).first():
        db.add(admin_user)
        db.add(cook_user)
    done = True