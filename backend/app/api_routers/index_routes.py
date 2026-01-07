from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from datetime import *


router = APIRouter(prefix="/api/index", tags=["index"])

@router.get("", response_model=schemas.MenuCreate)
def get_index(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    today = date.today()
    menu = db.query(models.Menu).filter(models.Menu.date == today).first()
    if not menu:
        return {"message": "Сегодня меню отсутствует"}
    return menu