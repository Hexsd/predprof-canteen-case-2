from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, update
from .. import models, auth, schemas
from ..database import get_db
from datetime import date
from typing import Optional, List, Tuple

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


@router.get('/appsas_all', response_model=List[schemas.Application])
def get_all_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin),
):
    applications = db.query(models.Application).all()
    print(applications)
    if not applications:
        raise HTTPException(
            status_code=404,
            detail="allah akbar"
        )
    return applications

@router.post("/apps_confirm")
def change_all_applications(
    applications: List[schemas.Application],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin),
):
    prev_applications = db.query(models.Application).all()
    for i in range(len(applications)):
        if applications[i].status == "Одобрена" and prev_applications[i].status != "Одобрена":
            products = applications[i].list_of_products.split('#')
            amounts = applications[i].amount_of_products.split('#')
            for j in range(len(products)):
                if db.query(models.Product).filter(models.Product.id == int(products[j])).first():
                    db.execute(update(models.Product).where(models.Product.id == int(products[j])).values(amount=models.Product.amount+int(amounts[j])))

        db.execute(update(models.Application).where(models.Application.id == applications[i].id).values(status=applications[i].status))
    db.commit()
    return

