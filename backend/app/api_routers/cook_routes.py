from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/cook", tags=["cook"])

@router.get("/products", response_model=List[schemas.Product])
def get_index(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    products = db.query(models.Product).all()
    print(products)
    if not products:
        return
    return products