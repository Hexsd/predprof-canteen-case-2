from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from datetime import date, timedelta

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

@router.post("/subscription/buy", response_model=schemas.Subscription)
def buy_subscription(
    sub_data: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут покупать абонемент")
    
    SUBSCRIPTION_PRICE_PER_DAY = 50
    total_price = sub_data.days * SUBSCRIPTION_PRICE_PER_DAY
    
    if current_user.balance < total_price:
        raise HTTPException(status_code=400, detail="Недостаточно средств")
    
    # Удалить старый абонемент, если он есть
    old_subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id
    ).first()
    if old_subscription:
        db.delete(old_subscription)
    
    start_date_val = date.today()
    end_date_val = start_date_val + timedelta(days=sub_data.days)
    
    subscription = models.Subscription(
        user_id=current_user.id,
        days=sub_data.days,
        start_date=start_date_val,
        end_date=end_date_val
    )
    
    current_user.balance -= total_price
    
    payment = models.Payment(
        user_id=current_user.id,
        amount=total_price,
        type="subscription",
        date=date.today()
    )
    db.add(payment)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return subscription

@router.get("/subscription/status", response_model=schemas.SubscriptionResponse)
def get_subscription_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id
    ).first()
    
    is_active = False
    days_remaining = 0
    
    if subscription and subscription.end_date >= date.today():
        is_active = True
        days_remaining = (subscription.end_date - date.today()).days
    
    return schemas.SubscriptionResponse(
        subscription=subscription,
        is_active=is_active,
        days_remaining=days_remaining
    )

@router.post("/meal/breakfast-with-subscription")
def get_breakfast_with_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут получать завтрак")
    
    subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id
    ).first()
    
    if not subscription or subscription.end_date < date.today():
        raise HTTPException(status_code=400, detail="Абонемент не активен")
    
    menu = db.query(models.Menu).filter(models.Menu.date == date.today()).first()
    if menu:
        menu.given_breakfasts += 1
    
    db.commit()
    
    return {"message": "Завтрак отмечен", "date": date.today()}

@router.post("/meal/lunch-with-subscription")
def get_lunch_with_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут получать обед")
    
    subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id
    ).first()
    
    if not subscription or subscription.end_date < date.today():
        raise HTTPException(status_code=400, detail="Абонемент не активен")
    
    menu = db.query(models.Menu).filter(models.Menu.date == date.today()).first()
    if menu:
        menu.given_lunches += 1
    
    db.commit()
    
    return {"message": "Обед отмечен", "date": date.today()}

@router.post("/balance/up")
def up_balance(
    up_request: schemas.BalanceUpRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут пополнять баланс")
    
    up_amount = up_request.amount
    payment = models.Payment(
        user_id=current_user.id,
        amount=up_amount,
        type="up_balance",
        date=date.today()
    )
    db.add(payment)
    current_user.balance += up_amount
    db.commit()
    db.refresh(current_user)
    return current_user
