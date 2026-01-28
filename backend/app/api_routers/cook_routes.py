from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import update
from typing import List, Tuple
from .. import models, schemas, auth
from ..database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/cook", tags=["cook"])

@router.get("/all", response_model=Tuple[List[schemas.Dish], List[schemas.Product], List[schemas.Alergen], List[schemas.Menu]])
def get_all(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    dishes = db.query(models.Dish).all()
    products = db.query(models.Product).all()
    alergens = db.query(models.Alergen).all()
    menu = db.query(models.Menu).all()
    if not dishes and not products and not alergens and not menu:
        return HTTPException("nothing there")
    return dishes, products, alergens, menu

@router.post("/change")
def post_changes(
    data: schemas.ChangeCook,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    for dish in data.dishes:
        db.execute(update(models.Dish).where(models.Dish.id==dish.id).values(amount=dish.amount))
    db.commit()
    for product in data.products:
        db.execute(update(models.Product).where(models.Product.id==product.id).values(amount=product.amount))
    db.commit()
    return

@router.post("/new_dish")
def new_position(
    dish: schemas.DishCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not db.query(models.Dish).filter(models.Dish.name == dish.name).first():
        db.add(models.Dish(name=dish.name, products=dish.products, amount=dish.amount))
    db.commit()
    return

@router.post("/new_product")
def new_position(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not db.query(models.Product).filter(models.Product.name == product.name).first():
        db.add(models.Product(name=product.name, alergens=product.alergens, amount=product.amount))
    db.commit()
    return

@router.post("/new_alergen")
def new_position(
    alergen: schemas.AlergenCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not db.query(models.Alergen).filter(models.Alergen.name == alergen.name).first():
        db.add(models.Alergen(name=alergen.name))
    db.commit()
    return


@router.get("/menu_{date}", response_model = schemas.Menu)
def menu(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):  
    date = datetime.strptime(date, "%Y-%m-%d").date()
    menu = db.query(models.Menu).filter(models.Menu.date == date).first()
    if not menu:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )
    print(date)
    return menu

@router.post("/new_menu")
def new_menu(
    menu: schemas.MenuCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if db.query(models.Menu).filter(models.Menu.date==menu.date).first():
        db.execute(update(models.Menu).where(models.Menu.date == menu.date).values(date=menu.date, breakfast=menu.breakfast, lunch=menu.lunch))
    else:
        db.add(models.Menu(date=menu.date, breakfast=menu.breakfast, given_breakfasts=0, lunch=menu.lunch, given_lunches=0))
    db.commit()
    return