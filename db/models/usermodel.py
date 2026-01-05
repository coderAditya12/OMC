from sqlalchemy.sql.schema import PrimaryKeyConstraint
from sqlalchemy import create_engine,String
from utils.config import DB_URL
from sqlalchemy.orm import DeclarativeBase,Mapped,MappedColumn,Session

try:
    engine = create_engine(DB_URL)
    with engine.connect():
        print("database connection successful")
except Exception as e:
    print("database connection",e)
class Base(DeclarativeBase):
    pass
class User(Base):
    __tablename__="users"
    id: Mapped[str] = MappedColumn(String(50), primary_key=True)
    name: Mapped[str] = MappedColumn(String(30))
    email: Mapped[str] = MappedColumn(String(100))

def init_db():
    try:
        Base.metadata.create_all(engine)
        
    except Exception as e:
        print(f"error in userModel:  {e}")

def create_sesseion():
    return Session(engine)

# Initialize database tables on module load
init_db()
