from database import Get_Tables, SessionCloser
from sqlalchemy import select
from fastapi import FastAPI

app = FastAPI()







if __name__ == "__main__":
    print("hello")
    for i in range(100):
        with SessionCloser() as db:
            print(db.execute(select(Get_Tables()["attendance"])).fetchall())