from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api_routers.user_routes import router as users_router
from .api_routers.auth_routes import router as auth_router
from .api_routers.index_routes import router as index_router
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

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}