from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
    total_users = db.query(models.User).count()
    
    # Return stats
    return {
        "totalUsers": total_users,
        "totalOrders": 0,
        "totalRevenue": 0,
        "averageOrderValue": 0
    }
