from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from datetime import date

router = APIRouter(prefix="/api/personal", tags=["users"])

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
    

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/{user_id}/alergens", response_model=schemas.User)
def update_user_alergens(
    user_id: int,
    alergens_update: schemas.UserAlergensUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user.id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Нет прав на обновление аллергенов этого пользователя")
    
    user.alergens = alergens_update.alergens
    db.commit()
    db.refresh(user)
    
    return user