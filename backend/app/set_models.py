from .database import engine, Base, context_manager
from .models import Menu
from datetime import date

done = False
with context_manager() as db:
    new_menu = Menu(date=date.today(), breakfast="Блинчики#Чай", lunch="Макароны с котлетой#Суп#Салат греческий#Компот")
    db.add(new_menu)
done = True