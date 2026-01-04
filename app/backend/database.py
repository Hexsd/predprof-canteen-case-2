from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData, Table

class Base(DeclarativeBase):
    pass

URL = "postgresql://postgres:12345admin@127.0.0.1:5432/canteen"

engine = create_engine(URL)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

metadata = MetaData()
metadata.reflect(bind=engine)

def Get_Tables():
    metadata.reflect(bind=engine)
    return metadata.tables


class SessionCloser():
    def __init__(self):
        self.db = Session()
    
    def __enter__(self):
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is None:
                self.db.commit()
            else:
                self.db.rollback()
        finally:
            self.db.close()
        return False
