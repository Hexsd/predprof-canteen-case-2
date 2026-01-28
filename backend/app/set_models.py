from .database import engine, Base, context_manager
from .models import Menu, User, UserRole, Dish, Product, Alergen
from datetime import date
from .auth import hash_password

done = False
with context_manager() as db:
    new_menu = Menu(date=date.today(), breakfast="Блинчики#Чай", lunch="Макароны с котлетой#Суп#Салат греческий#Компот")
    set_dishes = [Dish(name="Макароны по-флотски", products="1#2", amount=3), Dish(name="Компот из сухофруктов", products="2", amount=4)]
    set_products = [Product(name="Мясо", alergens="1", amount=4), Product(name="Макароны рожки", alergens="", amount=2)]
    set_alergens = [Alergen(name="Мясная продукция"), Alergen(name="Орешки"), Alergen(name="Лактоза")]

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