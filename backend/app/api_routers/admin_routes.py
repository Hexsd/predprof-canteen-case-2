from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, auth
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin)
):
    """
    Get admin statistics
    """
    total_payments = db.query(models.Payment).count()
    
    total_revenue = db.query(func.sum(models.Payment.amount)).scalar() or 0
    
    attendance = db.query(func.count(func.distinct(models.Payment.user_id))).scalar() or 0
    
    # Return stats
    return {
        "totalPayments": total_payments,
        "totalRevenue": total_revenue,
        "attendance": attendance
    }
