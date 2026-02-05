from .database import engine, Base, context_manager
from .models import Menu, User, UserRole, Dish, Product, Alergen
from datetime import date
from .auth import hash_password

done = False
with context_manager() as db:
    new_menu = Menu(date=date.today(), breakfast="3#4", lunch="1#2")
    set_dishes = [Dish(name="Макароны по-флотски", products="1#2", amount=3), Dish(name="Компот из сухофруктов", products="3", amount=4), Dish(name="Хлопья сладкие с молоком", products="5#6", amount=5), Dish(name="Черный чай", products="7", amount=6)]
    set_products = [Product(name="Фарш", alergens="1", amount=4), Product(name="Макароны рожки", alergens="4", amount=2), Product(name="Сухофрукты", alergens="9", amount=3), Product(name="Лук", alergens="", amount=5), Product(name="Молоко", alergens="3", amount=6), Product(name="Хлопья сладкие", alergens="4#3", amount=7), Product(name="Чай черный в пакетиках", alergens="", amount=8)]
    set_alergens = [Alergen(name="Мясная продукция"), Alergen(name="Орешки"), Alergen(name="Лактоза"), Alergen(name="Глютен"), Alergen(name="Рыба"), Alergen(name="Морепродукты"), Alergen(name="Соя"), Alergen(name="Яйца"), Alergen(name="Фрукты и ягоды")]

    db.add(new_menu)

    for alergen in set_alergens:
        if not db.query(Alergen).filter(Alergen.name == alergen.name).first():
            db.add(alergen)

    for dish in set_dishes:
        if not db.query(Dish).filter(Dish.name == dish.name).first():
            db.add(dish)

    for product in set_products:
        if not db.query(Product).filter(Product.name == product.name).first():
            db.add(product)

    admin_user= User(
        email="admin@example.com",
        name="Джейсон Стэтхэм",
        hashed_password=hash_password("admin"),
        birth_date=date.today(),
        role=UserRole.admin
    )
    cook_user = User(
        email="cook@example.com",
        name="Павел",
        hashed_password=hash_password("cook"),
        birth_date=date.today(),
        role=UserRole.cook
    )
    user_user = User(
        email="user@example.com",
        name="Петр",
        hashed_password=hash_password("user"),
        birth_date=date.today(),
        role=UserRole.student
    )
    if not db.query(User).filter(User.email == admin_user.email).first():
        db.add(admin_user)
        db.add(cook_user)
        db.add(user_user)
    done = True