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
    
    if review.rating >= current_user.preference_rating_threshold:
        existing_preference = db.query(models.StudentPreference).filter(
            models.StudentPreference.user_id == current_user.id,
            models.StudentPreference.dish_id == review.dish_id
        ).first()
        
        if not existing_preference:
            preference = models.StudentPreference(
                user_id=current_user.id,
                dish_id=review.dish_id
            )
            db.add(preference)
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


@router.get("/preferences", response_model=List[schemas.StudentPreferenceResponse])
def get_student_preferences(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут просматривать свои предпочтения")
    
    preferences = db.query(
        models.StudentPreference,
        models.Dish.name
    ).join(
        models.Dish,
        models.StudentPreference.dish_id == models.Dish.id
    ).filter(
        models.StudentPreference.user_id == current_user.id
    ).order_by(
        models.StudentPreference.created_at.desc()
    ).all()
    
    result = []
    for preference, dish_name in preferences:
        result.append({
            "id": preference.id,
            "dish_id": preference.dish_id,
            "dish_name": dish_name,
            "created_at": preference.created_at.isoformat()
        })
    
    return result


@router.delete("/preferences/{dish_id}")
def remove_student_preference(
    dish_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут удалять свои предпочтения")
    
    preference = db.query(models.StudentPreference).filter(
        models.StudentPreference.user_id == current_user.id,
        models.StudentPreference.dish_id == dish_id
    ).first()
    
    if not preference:
        raise HTTPException(status_code=404, detail="Предпочтение не найдено")
    
    db.delete(preference)
    db.commit()
    
    return {"message": "Предпочтение удалено"}


@router.get("/preferences/{dish_id}/check")
def check_dish_in_preferences(
    dish_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут проверять свои предпочтения")
    
    preference = db.query(models.StudentPreference).filter(
        models.StudentPreference.user_id == current_user.id,
        models.StudentPreference.dish_id == dish_id
    ).first()
    
    return {"in_preferences": preference is not None}