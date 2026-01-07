from .database import engine, Base, context_manager
from .models import Menu, User, UserRole
from datetime import date
from .auth import hash_password

done = False
with context_manager() as db:
    new_menu = Menu(date=date.today(), breakfast="Блинчики#Чай", lunch="Макароны с котлетой#Суп#Салат греческий#Компот")
    db.add(new_menu)
    admin_user= User(
        email="admin@example.com",
        name="Администратор",
        hashed_password=hash_password("admin"),
        birth_date=date.today(),
        role=UserRole.admin
    )
    if not db.query(User).filter(User.email == admin_user.email).first():
        db.add(admin_user)
    done = True