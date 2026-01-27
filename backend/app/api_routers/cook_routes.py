from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
from typing import List, Tuple
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/cook", tags=["cook"])

@router.get("/all", response_model=Tuple[List[schemas.Dish], List[schemas.Product], List[schemas.Alergen]])
def get_all(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    dishes = db.query(models.Dish).all()
    products = db.query(models.Product).all()
    alergens = db.query(models.Alergen).all()
    if not dishes and not products and not alergens:
        return HTTPException("gay")
    return dishes, products, alergens

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