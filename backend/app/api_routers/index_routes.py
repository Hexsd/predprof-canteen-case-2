from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db
from datetime import *


router = APIRouter(prefix="/api/index", tags=["index"])

@router.get("", response_model=schemas.Menu)
def get_index(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
    date_param: Optional[str] = Query(None, alias="date")
):
    if date_param:
        try:
            menu_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат даты. Используйте YYYY-MM-DD")
    else:
        menu_date = date.today()
    
    menu = db.query(models.Menu).filter(models.Menu.date == menu_date).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Меню на указанную дату не найдено")
    return menu