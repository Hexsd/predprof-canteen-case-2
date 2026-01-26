from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Tuple
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/cook", tags=["cook"])

@router.get("/all", response_model=Tuple[List[schemas.Dish], List[schemas.Product]])
def get_index(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    dishes = db.query(models.Dish).all()
    products = db.query(models.Product).all()
    if not dishes and not products:
        return HTTPException("gay")
    return dishes, products