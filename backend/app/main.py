from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api_routers.user_routes import router as users_router
from .api_routers.auth_routes import router as auth_router
from .api_routers.index_routes import router as index_router
from .api_routers.cook_routes import router as cook_router
from .api_routers.admin_routes import router as admin_router
from .api_routers.personal_routes import router as personal_router
from .api_routers.notifications_routes import router as notifications_router
from .api_routers.reviews_routes import router as reviews_router
import time

for i in range(30):
    try:
        Base.metadata.create_all(bind=engine)
        break
    except Exception:
        time.sleep(1)


from .set_models import done
print(f"Initial data setup done: {done}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(index_router)
app.include_router(cook_router)
app.include_router(admin_router)
app.include_router(personal_router)
app.include_router(notifications_router)
app.include_router(reviews_router)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}