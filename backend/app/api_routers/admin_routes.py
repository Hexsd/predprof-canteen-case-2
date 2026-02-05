from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, update
from .. import models, auth, schemas
from ..database import get_db
from datetime import date, datetime
from typing import Optional, List, Tuple, Set
from .notifications_routes import send_notification
import csv
import io
from calendar import monthrange
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

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
        revenue_payments = db.query(models.Payment).filter(
            models.Payment.delivery_date == query_date,
            models.Payment.type.in_(["breakfast", "lunch", "subscription"]),
            models.Payment.amount > 0
        ).all()
        
        meal_payments = db.query(models.Payment).filter(
            models.Payment.delivery_date == query_date,
            models.Payment.type.in_(["breakfast", "lunch"])
        ).all()
        
        approved_applications = db.query(models.Application).filter(
            models.Application.date == query_date,
            models.Application.status == "Одобрена"
        ).all()
        
        total_revenue = sum(p.amount for p in revenue_payments) if revenue_payments else 0
        attendance = len(set(p.user_id for p in meal_payments)) if meal_payments else 0
        total_payments = len([p for p in meal_payments if p.amount > 0])
        
        total_expenses = 0
        for app in approved_applications:
            prices = app.price_of_products.split('#') if app.price_of_products else []
            amounts = app.amount_of_products.split('#') if app.amount_of_products else []
            for i, price in enumerate(prices):
                try:
                    if i < len(amounts):
                        total_expenses += float(price) * int(amounts[i])
                except (ValueError, IndexError):
                    pass
        
        total_profit = total_revenue - total_expenses
        
        menu = db.query(models.Menu).filter(models.Menu.date == query_date).first()
        given_breakfasts = menu.given_breakfasts if menu else 0
        given_lunches = menu.given_lunches if menu else 0
    else:
        revenue_payments = db.query(models.Payment).filter(
            models.Payment.type.in_(["breakfast", "lunch", "subscription"]),
            models.Payment.amount > 0
        ).all()
        
        meal_payments = db.query(models.Payment).filter(
            models.Payment.type.in_(["breakfast", "lunch"])
        ).all()
        
        approved_applications = db.query(models.Application).filter(
            models.Application.status == "Одобрена"
        ).all()
        
        total_revenue = sum(p.amount for p in revenue_payments) if revenue_payments else 0
        attendance = len(set(p.user_id for p in meal_payments)) if meal_payments else 0
        total_payments = len([p for p in meal_payments if p.amount > 0])
        
        total_expenses = 0
        for app in approved_applications:
            prices = app.price_of_products.split('#') if app.price_of_products else []
            amounts = app.amount_of_products.split('#') if app.amount_of_products else []
            for i, price in enumerate(prices):
                try:
                    if i < len(amounts):
                        total_expenses += float(price) * int(amounts[i])
                except (ValueError, IndexError):
                    pass
        
        total_profit = total_revenue - total_expenses
        
        result = db.query(
            func.sum(models.Menu.given_breakfasts),
            func.sum(models.Menu.given_lunches)
        ).first()
        given_breakfasts = result[0] or 0 if result else 0
        given_lunches = result[1] or 0 if result else 0
    
    return {
        "totalPayments": total_payments,
        "totalRevenue": total_revenue,
        "totalExpenses": total_expenses,
        "totalProfit": total_profit,
        "attendance": attendance,
        "givenBreakfasts": given_breakfasts,
        "givenLunches": given_lunches
    }


@router.get("/stats_monthly")
def get_stats_monthly(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin)
):
    today = date.today()
    start_date = date(today.year, today.month, 1)
    last_day = monthrange(today.year, today.month)[1]
    end_date = date(today.year, today.month, last_day)
    
    revenue_payments = db.query(models.Payment).filter(
        models.Payment.delivery_date >= start_date,
        models.Payment.delivery_date <= end_date,
        models.Payment.type.in_(["breakfast", "lunch", "subscription"]),
        models.Payment.amount > 0
    ).all()
    
    meal_payments = db.query(models.Payment).filter(
        models.Payment.delivery_date >= start_date,
        models.Payment.delivery_date <= end_date,
        models.Payment.type.in_(["breakfast", "lunch"])
    ).all()
    
    approved_applications = db.query(models.Application).filter(
        models.Application.date >= start_date,
        models.Application.date <= end_date,
        models.Application.status == "Одобрена"
    ).all()
    
    menus = db.query(models.Menu).filter(
        models.Menu.date >= start_date,
        models.Menu.date <= end_date
    ).all()
    
    daily_data = {}
    for day in range(1, last_day + 1):
        current_date = date(today.year, today.month, day)
        daily_data[current_date] = {
            "date": str(current_date),
            "revenue": 0,
            "expenses": 0,
            "profit": 0,
            "attendance": 0,
            "meals": 0,
            "breakfasts": 0,
            "lunches": 0
        }
    
    for payment in revenue_payments:
        if payment.delivery_date in daily_data:
            daily_data[payment.delivery_date]["revenue"] += payment.amount
    
    daily_users = {}
    for payment in meal_payments:
        if payment.delivery_date in daily_data:
            if payment.amount > 0:
                daily_data[payment.delivery_date]["meals"] += 1
            if payment.delivery_date not in daily_users:
                daily_users[payment.delivery_date] = set()
            daily_users[payment.delivery_date].add(payment.user_id)
    
    for date_key, users in daily_users.items():
        daily_data[date_key]["attendance"] = len(users)
    
    for app in approved_applications:
        if app.date in daily_data:
            prices = app.price_of_products.split('#') if app.price_of_products else []
            amounts = app.amount_of_products.split('#') if app.amount_of_products else []
            for i, price in enumerate(prices):
                try:
                    if i < len(amounts):
                        daily_data[app.date]["expenses"] += float(price) * int(amounts[i])
                except (ValueError, IndexError):
                    pass
    
    for menu in menus:
        if menu.date in daily_data:
            daily_data[menu.date]["breakfasts"] = menu.given_breakfasts
            daily_data[menu.date]["lunches"] = menu.given_lunches
    
    for date_key in daily_data:
        daily_data[date_key]["profit"] = daily_data[date_key]["revenue"] - daily_data[date_key]["expenses"]
    
    return sorted(daily_data.values(), key=lambda x: x["date"])


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

        if applications[i].status != prev_applications[i].status:
            cook = db.query(models.User).filter(models.User.id == applications[i].user_id).first()
            if cook:
                send_notification(
                    cook.id,
                    f"Статус вашей заявки изменён на: {applications[i].status}",
                    "status_change"
                )
        
        db.execute(update(models.Application).where(models.Application.id == applications[i].id).values(status=applications[i].status))
    db.commit()
    return


@router.get("/export_stats")
def export_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_admin),
    period: str = Query("day", regex="^(day|month|year)$")
):
    today = date.today()
    
    if period == "day":
        start_date = today
        end_date = today
        filename = f"stats_day_{today.isoformat()}.csv"
    elif period == "month":
        start_date = date(today.year, today.month, 1)
        last_day = monthrange(today.year, today.month)[1]
        end_date = date(today.year, today.month, last_day)
        filename = f"stats_month_{today.year}_{today.month:02d}.csv"
    else:
        start_date = date(today.year, 1, 1)
        end_date = date(today.year, 12, 31)
        filename = f"stats_year_{today.year}.csv"
    
    revenue_payments = db.query(models.Payment).filter(
        models.Payment.delivery_date >= start_date,
        models.Payment.delivery_date <= end_date,
        models.Payment.type.in_(["breakfast", "lunch", "subscription"]),
        models.Payment.amount > 0
    ).all()
    
    meal_payments = db.query(models.Payment).filter(
        models.Payment.delivery_date >= start_date,
        models.Payment.delivery_date <= end_date,
        models.Payment.type.in_(["breakfast", "lunch"])
    ).all()
    
    menus = db.query(models.Menu).filter(
        models.Menu.date >= start_date,
        models.Menu.date <= end_date
    ).all()
    
    approved_applications = db.query(models.Application).filter(
        models.Application.date >= start_date,
        models.Application.date <= end_date,
        models.Application.status == "Одобрена"
    ).all()
    
    total_revenue = sum(p.amount for p in revenue_payments) if revenue_payments else 0
    unique_users = len(set(p.user_id for p in meal_payments)) if meal_payments else 0
    total_meal_payments = len([p for p in meal_payments if p.amount > 0])
    total_breakfasts = sum(m.given_breakfasts for m in menus) if menus else 0
    total_lunches = sum(m.given_lunches for m in menus) if menus else 0
    total_expenses = 0
    for app in approved_applications:
        prices = app.price_of_products.split('#') if app.price_of_products else []
        amounts = app.amount_of_products.split('#') if app.amount_of_products else []
        for i, price in enumerate(prices):
            try:
                if i < len(amounts):
                    total_expenses += float(price) * int(amounts[i])
            except (ValueError, IndexError):
                pass
    
    total_profit = total_revenue - total_expenses
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Отчет о статистике столовой"])
    writer.writerow([f"Период: {period}"])
    writer.writerow([f"с {start_date} по {end_date}"])
    writer.writerow([])
    
    writer.writerow(["Метрика", "Значение"])
    writer.writerow(["Продано завтраков и обедов", total_meal_payments])
    writer.writerow(["Выручка (₽)", total_revenue])
    writer.writerow(["Расходы (₽)", total_expenses])
    writer.writerow(["Прибыль (₽)", total_profit])
    writer.writerow(["Уникальные посетители", unique_users])
    writer.writerow(["Завтраков выдано (по меню)", total_breakfasts])
    writer.writerow(["Обедов выдано (по меню)", total_lunches])
    writer.writerow([])
    
    if period != "day":
        writer.writerow(["Ежедневная статистика"])
        writer.writerow(["Дата", "Продано блюд", "Выручка (₽)", "Расходы (₽)", "Прибыль (₽)", "Уникальные посетители", "Завтраков", "Обедов"])
        
        daily_data = {}
        for payment in revenue_payments:
            if payment.delivery_date not in daily_data:
                daily_data[payment.delivery_date] = {"revenue": 0, "expenses": 0, "users": set()}
            daily_data[payment.delivery_date]["revenue"] += payment.amount
        
        for payment in meal_payments:
            if payment.delivery_date not in daily_data:
                daily_data[payment.delivery_date] = {"meal_count": 0, "revenue": 0, "expenses": 0, "users": set()}
            if payment.amount > 0:
                daily_data[payment.delivery_date]["meal_count"] = daily_data[payment.delivery_date].get("meal_count", 0) + 1
            daily_data[payment.delivery_date]["users"].add(payment.user_id)
        
        for app in approved_applications:
            if app.date not in daily_data:
                daily_data[app.date] = {"revenue": 0, "expenses": 0, "users": set()}
            prices = app.price_of_products.split('#') if app.price_of_products else []
            amounts = app.amount_of_products.split('#') if app.amount_of_products else []
            for i, price in enumerate(prices):
                try:
                    if i < len(amounts):
                        daily_data[app.date]["expenses"] += float(price) * int(amounts[i])
                except (ValueError, IndexError):
                    pass
        
        for menu in menus:
            if menu.date not in daily_data:
                daily_data[menu.date] = {"revenue": 0, "expenses": 0, "users": set(), "breakfasts": 0, "lunches": 0}
            daily_data[menu.date]["breakfasts"] = menu.given_breakfasts
            daily_data[menu.date]["lunches"] = menu.given_lunches
        
        for date_key in sorted(daily_data.keys()):
            data = daily_data[date_key]
            revenue = data.get("revenue", 0)
            expenses = data.get("expenses", 0)
            profit = revenue - expenses
            writer.writerow([
                date_key,
                data.get("meal_count", 0),
                revenue,
                expenses,
                profit,
                len(data.get("users", set())),
                data.get("breakfasts", 0),
                data.get("lunches", 0)
            ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.websocket("/ws/stats")
async def websocket_stats(websocket: WebSocket, db: Session = Depends(get_db)):
    try:
        await manager.connect(websocket)
        
        import asyncio
        
        while True:
            today = date.today()
            dateStr = today.isoformat()
            
            revenue_payments = db.query(models.Payment).filter(
                models.Payment.delivery_date == today,
                models.Payment.type.in_(["breakfast", "lunch", "subscription"]),
                models.Payment.amount > 0
            ).all()
            
            meal_payments = db.query(models.Payment).filter(
                models.Payment.delivery_date == today,
                models.Payment.type.in_(["breakfast", "lunch"])
            ).all()
            
            approved_applications = db.query(models.Application).filter(
                models.Application.date == today,
                models.Application.status == "Одобрена"
            ).all()
            
            menu = db.query(models.Menu).filter(models.Menu.date == today).first()
            
            total_revenue = sum(p.amount for p in revenue_payments) if revenue_payments else 0
            attendance = len(set(p.user_id for p in meal_payments)) if meal_payments else 0
            total_payments = len([p for p in meal_payments if p.amount > 0])
            
            total_expenses = 0
            for app in approved_applications:
                prices = app.price_of_products.split('#') if app.price_of_products else []
                amounts = app.amount_of_products.split('#') if app.amount_of_products else []
                for i, price in enumerate(prices):
                    try:
                        if i < len(amounts):
                            total_expenses += float(price) * int(amounts[i])
                    except (ValueError, IndexError):
                        pass
            
            total_profit = total_revenue - total_expenses
            
            given_breakfasts = menu.given_breakfasts if menu else 0
            given_lunches = menu.given_lunches if menu else 0
            
            stats_data = {
                "totalPayments": total_payments,
                "totalRevenue": total_revenue,
                "totalExpenses": total_expenses,
                "totalProfit": total_profit,
                "attendance": attendance,
                "givenBreakfasts": given_breakfasts,
                "givenLunches": given_lunches,
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send_json(stats_data)
            
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


