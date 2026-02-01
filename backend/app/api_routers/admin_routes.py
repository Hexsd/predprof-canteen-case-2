from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, auth
from ..database import get_db
from datetime import date
from typing import Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin),
    date_param: Optional[str] = Query(None, alias="date")
):
    query_date = None
    if date_param:
        try:
            from datetime import datetime
            query_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат даты. Используйте YYYY-MM-DD")
    
    if query_date:
        total_payments = db.query(models.Payment).filter(models.Payment.date == query_date).count()
        total_revenue = db.query(func.sum(models.Payment.amount)).filter(models.Payment.date == query_date).scalar() or 0
        
        attendance = db.query(func.count(func.distinct(models.Payment.user_id))).filter(models.Payment.date == query_date).scalar() or 0
        
        menu = db.query(models.Menu).filter(models.Menu.date == query_date).first()
        given_breakfasts = menu.given_breakfasts if menu else 0
        given_lunches = menu.given_lunches if menu else 0
    else:
        total_payments = db.query(models.Payment).count()
        total_revenue = db.query(func.sum(models.Payment.amount)).scalar() or 0
        attendance = db.query(func.count(func.distinct(models.Payment.user_id))).scalar() or 0
        result = db.query(
            func.sum(models.Menu.given_breakfasts),
            func.sum(models.Menu.given_lunches)
        ).first()
        given_breakfasts = result[0] or 0 if result else 0
        given_lunches = result[1] or 0 if result else 0
    
    return {
        "totalPayments": total_payments,
        "totalRevenue": total_revenue,
        "attendance": attendance,
        "givenBreakfasts": given_breakfasts,
        "givenLunches": given_lunches
    }
