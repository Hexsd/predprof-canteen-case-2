from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
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

@router.post("/buy/breakfast", response_model=schemas.BuyMealResponse)
def buy_breakfast(
    delivery_date: date = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут покупать завтрак")
    
    BREAKFAST_PRICE = 150
    if current_user.balance < BREAKFAST_PRICE:
        raise HTTPException(status_code=400, detail="Недостаточно средств")
    
    today = date.today()
    meal_delivery_date = delivery_date if delivery_date else today
    
    # Start atomic transaction block
    try:
        # 1. Check Balance
        if current_user.balance < BREAKFAST_PRICE:
            raise HTTPException(status_code=400, detail="Недостаточно средств")
        
        # 2. Get Menu
        menu = db.query(models.Menu).filter(models.Menu.date == meal_delivery_date).first()
        if menu:
            menu.given_breakfasts += 1
            breakfast_dishes = menu.breakfast.split('#') if menu.breakfast else []
        else:
            breakfast_dishes = []

        # 3. Check and Update Stock (Atomic)
        # We need to lock the rows or use atomic updates. Since SQLite has limited locking, 
        # we will rely on checking the count in the update statement or fetching with lock if using PostgreSQL.
        # Assuming typical SQL behavior, we can check row count after update or use with_for_update.
        # Given the context, we'll try to update and check affected rows or pre-check with lock behavior.
        # For simplicity and robustness here:
        
        for dish_id in breakfast_dishes:
            # We want to decrement amount ONLY if amount > 0.
            # update returns the number of matched rows.
            result = db.execute(
                update(models.Dish)
                .where(models.Dish.id == int(dish_id))
                .where(models.Dish.amount > 0)
                .values(amount=models.Dish.amount - 1)
            )
            
            # If rowcount is 0, it means either dish doesn't exist or amount was <= 0
            # Since we know dish exists from menu (mostly), it implies 0 stock.
            if result.rowcount == 0:
                # Check if dish actually exists to distinguish between "not found" vs "no stock"
                dish_exists = db.query(models.Dish).filter(models.Dish.id == int(dish_id)).first()
                if not dish_exists:
                     # This might happen if menu has invalid ID, skip or error.
                     # Better to error for consistency.
                     raise HTTPException(status_code=500, detail=f"Блюдо {dish_id} не найдено")
                
                # If existing but update failed, it means Out of Stock
                raise HTTPException(status_code=400, detail="Невозможно укомплектовать завтрак: закончились продукты")

        # 4. Process Payment
        # Deduct balance
        # Note: We are modifying the instance freshly loaded in this transaction context
        current_user.balance -= BREAKFAST_PRICE
        
        payment = models.Payment(
            user_id=current_user.id,
            amount=BREAKFAST_PRICE,
            type="breakfast",
            purchase_date=today,
            delivery_date=meal_delivery_date
        )
        db.add(payment)
        
        # 5. Record Meal Status
        meal_record = db.query(models.MealRecord).filter(
            models.MealRecord.user_id == current_user.id,
            models.MealRecord.date == meal_delivery_date
        ).with_for_update().first() # Lock this record if it exists
        
        if not meal_record:
            meal_record = models.MealRecord(
                user_id=current_user.id,
                date=meal_delivery_date,
                breakfast="completed",
                lunch=None
            )
            db.add(meal_record)
        else:
            meal_record.breakfast = "completed"
        
        # 6. History
        meal_history = models.MealHistory(
            user_id=current_user.id,
            meal_type="breakfast",
            date=meal_delivery_date,
            source="purchased",
            dishes="#".join(str(d) for d in breakfast_dishes)
        )
        db.add(meal_history)
        
        # FINAL COMMIT - All or Nothing
        db.commit()
        db.refresh(current_user)
        
        return {
            "user": current_user,
            "meal_type": "breakfast",
            "breakfast_dishes": breakfast_dishes
        }

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/buy/lunch", response_model=schemas.BuyMealResponse)
def buy_lunch(
    delivery_date: date = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут покупать обед")
    
    LUNCH_PRICE = 300
    if current_user.balance < LUNCH_PRICE:
        raise HTTPException(status_code=400, detail="Недостаточно средств")
    
    today = date.today()
    meal_delivery_date = delivery_date if delivery_date else today

    try:
        if current_user.balance < LUNCH_PRICE:
            raise HTTPException(status_code=400, detail="Недостаточно средств")

        menu = db.query(models.Menu).filter(models.Menu.date == meal_delivery_date).first()
        if menu:
            menu.given_lunches += 1
            lunch_dishes = menu.lunch.split('#') if menu.lunch else []
        else:
            lunch_dishes = []

        for dish_id in lunch_dishes:
            result = db.execute(
                update(models.Dish)
                .where(models.Dish.id == int(dish_id))
                .where(models.Dish.amount > 0)
                .values(amount=models.Dish.amount - 1)
            )
            
            if result.rowcount == 0:
                dish_exists = db.query(models.Dish).filter(models.Dish.id == int(dish_id)).first()
                if not dish_exists:
                     raise HTTPException(status_code=500, detail=f"Блюдо {dish_id} не найдено")
                raise HTTPException(status_code=400, detail="Невозможно укомплектовать обед: закончились продукты")

        current_user.balance -= LUNCH_PRICE
        
        payment = models.Payment(
            user_id=current_user.id,
            amount=LUNCH_PRICE,
            type="lunch",
            purchase_date=today,
            delivery_date=meal_delivery_date
        )
        db.add(payment)
        
        meal_record = db.query(models.MealRecord).filter(
            models.MealRecord.user_id == current_user.id,
            models.MealRecord.date == meal_delivery_date
        ).with_for_update().first()
        
        if not meal_record:
            meal_record = models.MealRecord(
                user_id=current_user.id,
                date=meal_delivery_date,
                breakfast=None,
                lunch="completed"
            )
            db.add(meal_record)
        else:
            meal_record.lunch = "completed"
        
        meal_history = models.MealHistory(
            user_id=current_user.id,
            meal_type="lunch",
            date=meal_delivery_date,
            source="purchased",
            dishes="#".join(str(d) for d in lunch_dishes)
        )
        db.add(meal_history)
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "user": current_user,
            "meal_type": "lunch",
            "lunch_dishes": lunch_dishes
        }
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subscription/buy", response_model=schemas.Subscription)
def buy_subscription(
    sub_data: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут покупать абонемент")
    
    SUBSCRIPTION_PRICE_PER_DAY = 300
    total_price = sub_data.days * SUBSCRIPTION_PRICE_PER_DAY
    
    if current_user.balance < total_price:
        raise HTTPException(status_code=400, detail="Недостаточно средств")
    
    old_subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id
    ).first()
    if old_subscription:
        db.delete(old_subscription)
    
    today = date.today()
    start_date_val = today
    end_date_val = start_date_val + timedelta(days=sub_data.days)
    
    subscription = models.Subscription(
        user_id=current_user.id,
        days=sub_data.days,
        start_date=start_date_val,
        end_date=end_date_val
    )
    
    current_user.balance -= total_price
    
    daily_price = SUBSCRIPTION_PRICE_PER_DAY
    for day_offset in range(sub_data.days):
        delivery_date = start_date_val + timedelta(days=day_offset)
        payment = models.Payment(
            user_id=current_user.id,
            amount=daily_price,
            type="subscription",
            purchase_date=today,
            delivery_date=delivery_date
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
    
    today = date.today()

    try:
        menu = db.query(models.Menu).filter(models.Menu.date == today).first()
        if menu:
            menu.given_breakfasts += 1
            breakfast_dishes = menu.breakfast.split('#') if menu.breakfast else []
        else:
            breakfast_dishes = []

        # Atomic Stock Update
        for dish_id in breakfast_dishes:
            result = db.execute(
                update(models.Dish)
                .where(models.Dish.id == int(dish_id))
                .where(models.Dish.amount > 0)
                .values(amount=models.Dish.amount - 1)
            )
            if result.rowcount == 0:
                 dish_exists = db.query(models.Dish).filter(models.Dish.id == int(dish_id)).first()
                 if not dish_exists:
                      raise HTTPException(status_code=500, detail=f"Блюдо {dish_id} не найдено")
                 raise HTTPException(status_code=400, detail="Невозможно укомплектовать завтрак: закончились продукты")

        
        meal_record = db.query(models.MealRecord).filter(
            models.MealRecord.user_id == current_user.id,
            models.MealRecord.date == today
        ).with_for_update().first()
        
        if meal_record:
            if meal_record.breakfast and meal_record.breakfast in ["pending", "completed"]:
                raise HTTPException(status_code=400, detail="Завтрак уже получен на сегодня")
            meal_record.breakfast = "completed"
        else:
            meal_record = models.MealRecord(
                user_id=current_user.id,
                date=today,
                breakfast="completed",
                lunch=None
            )
            db.add(meal_record)
        
        dummy_payment = models.Payment(
            user_id=current_user.id,
            amount=0,
            type="breakfast",
            purchase_date=today,
            delivery_date=today
        )
        db.add(dummy_payment)
        
        if menu:
            breakfast_dishes = menu.breakfast.split('#') if menu.breakfast else []
        else:
            breakfast_dishes = []
        
        meal_history = models.MealHistory(
            user_id=current_user.id,
            meal_type="breakfast",
            date=today,
            source="subscription",
            dishes="#".join(str(d) for d in breakfast_dishes)
        )
        db.add(meal_history)
        
        db.commit()
        
        return {
            "message": "Завтрак получен, оставьте отзыв",
            "date": today,
            "meal_type": "breakfast",
            "dishes": breakfast_dishes
        }
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

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
    
    today = date.today()

    try:
        menu = db.query(models.Menu).filter(models.Menu.date == today).first()
        if menu:
            menu.given_lunches += 1
            lunch_dishes = menu.lunch.split('#') if menu.lunch else []
        else:
            lunch_dishes = []

        # Atomic Stock Update
        for dish_id in lunch_dishes:
            result = db.execute(
                update(models.Dish)
                .where(models.Dish.id == int(dish_id))
                .where(models.Dish.amount > 0)
                .values(amount=models.Dish.amount - 1)
            )
            if result.rowcount == 0:
                 dish_exists = db.query(models.Dish).filter(models.Dish.id == int(dish_id)).first()
                 if not dish_exists:
                      raise HTTPException(status_code=500, detail=f"Блюдо {dish_id} не найдено")
                 raise HTTPException(status_code=400, detail="Невозможно укомплектовать обед: закончились продукты")
        
        meal_record = db.query(models.MealRecord).filter(
            models.MealRecord.user_id == current_user.id,
            models.MealRecord.date == today
        ).with_for_update().first()
        
        if meal_record:
            if meal_record.lunch and meal_record.lunch in ["pending", "completed"]:
                raise HTTPException(status_code=400, detail="Обед уже получен на сегодня")
            meal_record.lunch = "completed"
        else:
            meal_record = models.MealRecord(
                user_id=current_user.id,
                date=today,
                breakfast=None,
                lunch="completed"
            )
            db.add(meal_record)
        
        dummy_payment = models.Payment(
            user_id=current_user.id,
            amount=0,
            type="lunch",
            purchase_date=today,
            delivery_date=today
        )
        db.add(dummy_payment)
        
        if menu:
            lunch_dishes = menu.lunch.split('#') if menu.lunch else []
        else:
            lunch_dishes = []
        
        meal_history = models.MealHistory(
            user_id=current_user.id,
            meal_type="lunch",
            date=date.today(),
            source="subscription",
            dishes="#".join(str(d) for d in lunch_dishes)
        )
        db.add(meal_history)
        
        db.commit()
        
        return {
            "message": "Обед получен, оставьте отзыв",
            "date": date.today(),
            "meal_type": "lunch",
            "dishes": lunch_dishes
        }
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/balance/up")
def up_balance(
    up_request: schemas.BalanceUpRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут пополнять баланс")
    
    today = date.today()
    up_amount = up_request.amount
    payment = models.Payment(
        user_id=current_user.id,
        amount=up_amount,
        type="up_balance",
        purchase_date=today,
        delivery_date=today
    )
    db.add(payment)
    current_user.balance += up_amount
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/meal/status")
def get_meal_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    meal_record = db.query(models.MealRecord).filter(
        models.MealRecord.user_id == current_user.id,
        models.MealRecord.date == date.today()
    ).first()
    
    return {
        "breakfast_status": meal_record.breakfast if meal_record else None,
        "lunch_status": meal_record.lunch if meal_record else None
    }


@router.get("/meal/history")
def get_meal_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
    limit: int = 50
):
    history = db.query(models.MealHistory).filter(
        models.MealHistory.user_id == current_user.id
    ).order_by(
        models.MealHistory.created_at.desc()
    ).limit(limit).all()
    
    result = []
    for record in history:
        result.append({
            "id": record.id,
            "meal_type": record.meal_type,
            "date": record.date.isoformat(),
            "source": record.source,
            "dishes": record.dishes.split('#') if record.dishes else [],
            "created_at": record.created_at.isoformat()
        })
    
    return result
