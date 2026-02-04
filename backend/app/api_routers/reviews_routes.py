from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from datetime import datetime, date

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=schemas.ReviewCreate)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут оставлять отзывы")
    
    dish = db.query(models.Dish).filter(models.Dish.id == review.dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Оценка должна быть от 1 до 5")
    
    existing_review = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.dish_id == review.dish_id,
        func.date(models.Review.created_at) == date.today()
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="Вы уже оставили отзыв на это блюдо сегодня")
    
    db_review = models.Review(
        user_id=current_user.id,
        dish_id=review.dish_id,
        rating=review.rating,
        text=review.text,
        created_at=datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return review


@router.get("/dish/{dish_id}", response_model=List[schemas.ReviewResponse])
def get_reviews_by_dish(
    dish_id: int,
    db: Session = Depends(get_db)
):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    
    reviews = db.query(
        models.Review,
        models.User.name
    ).join(
        models.User,
        models.Review.user_id == models.User.id
    ).filter(
        models.Review.dish_id == dish_id
    ).order_by(
        models.Review.created_at.desc()
    ).all()
    
    result = []
    for review, username in reviews:
        result.append({
            "id": review.id,
            "user_id": review.user_id,
            "dish_id": review.dish_id,
            "rating": review.rating,
            "text": review.text,
            "created_at": review.created_at.isoformat(),
            "username": username
        })
    
    return result


@router.get("/stats/{dish_id}", response_model=schemas.ReviewStats)
def get_review_stats(
    dish_id: int,
    db: Session = Depends(get_db)
):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    
    result = db.query(
        func.avg(models.Review.rating).label("avg_rating"),
        func.count(models.Review.id).label("count")
    ).filter(
        models.Review.dish_id == dish_id
    ).first()
    
    if result.count == 0:
        return {"average_rating": 0.0, "count": 0}
    
    return {
        "average_rating": float(result.avg_rating) if result.avg_rating else 0.0,
        "count": result.count
    }