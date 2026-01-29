from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from datetime import date

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("", response_model=List[schemas.User])
def get_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.User).all()

@router.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.put("/{user_id}/role", response_model=schemas.User)
def update_user_role(
    user_id: int,
    role_update: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить роль самому себе")

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/buy/breakfast", response_model=schemas.User)
def buy_breakfast(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут покупать завтрак")
    
    BREAKFAST_PRICE = 150
    if current_user.balance < BREAKFAST_PRICE:
        raise HTTPException(status_code=400, detail="Недостаточно средств")
    
    payment = models.Payment(
        user_id=current_user.id,
        amount=BREAKFAST_PRICE,
        type="breakfast",
        date=date.today()
    )
    db.add(payment)
    
    current_user.balance -= BREAKFAST_PRICE
    
    menu = db.query(models.Menu).filter(models.Menu.date == date.today()).first()
    if menu:
        menu.given_breakfasts += 1
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/buy/lunch", response_model=schemas.User)
def buy_lunch(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут покупать обед")
    
    LUNCH_PRICE = 300
    if current_user.balance < LUNCH_PRICE:
        raise HTTPException(status_code=400, detail="Недостаточно средств")
    
    payment = models.Payment(
        user_id=current_user.id,
        amount=LUNCH_PRICE,
        type="lunch",
        date=date.today()
    )
    db.add(payment)
    
    current_user.balance -= LUNCH_PRICE
    
    menu = db.query(models.Menu).filter(models.Menu.date == date.today()).first()
    if menu:
        menu.given_lunches += 1
    
    db.commit()
    db.refresh(current_user)
    
    return current_user