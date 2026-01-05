from sqlalchemy import create_engine
from utils.config import DB_URL
def main():
    try:
        engine = create_engine(DB_URL)
        with engine.connect():
            print("database connection successful")
    except Exception as e:
        print("database connection",e)

if __name__ == "__main__":
    main()
