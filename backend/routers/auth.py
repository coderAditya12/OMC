from fastapi import APIRouter,Depends
from backend.staticmodel.pymodel import AuthRequest
from sqlalchemy.orm import Session
from db.database import get_db
from db.models.usermodel import User
router = APIRouter()
@router.post("/auth/github")
def auth_github(data:AuthRequest,db:Session = Depends(get_db)):
    """
    store the user data into database    
    """
    #check user exist
    print("data receieved")
    existing_user = db.query(User).where(User.email==data.email).first()
    if existing_user:
        return{
            "status":"success",
            "user":{
                "email":data.email,
                "name":data.name,
                "image":data.image
            }
        }
    new_user = User(
        email=data.email,
        name=data.name,
        image=data.image
    )
    db.add(new_user)
    db.commit()
    return{
            "status":"success",
            "user":{
                "email":data.email,
                "name":data.name,
                "image":data.image
            }
        } 
