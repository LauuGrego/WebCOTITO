from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pymongo.collection import Collection
from pymongo import MongoClient
from bson import ObjectId
from app.models.user import User, UserBase, UserCreate
from app.db.client import db_client
import pymongo
from typing import Optional

# Constants
ALGORITHM = "HS256"
ACCESS_TOKEN_DURATION = 200
SECRET = "gwtfdtdgjiemlopckj98763tgcuebcdsshgdywxbg65423324r"

# Router setup
router = APIRouter()

# OAuth2 setup
oauth2 = OAuth2PasswordBearer(tokenUrl="/usuarios/login")

# Cryptography context
crypt_context = CryptContext(schemes=["bcrypt"])

# Database collection
users_collection = db_client.users

# Helper functions
# -----------------
def search_user_db(field: str, key: str) -> Optional[User]:
    try:
        user = users_collection.find_one({field: key})
        if user:
            user["_id"] = str(user["_id"])
            return User(**user)
    except Exception as e:
        print(f"Error buscando usuario en DB: {e}")
    return None

def search_user(field: str, key) -> Optional[UserBase]:
    try:
        user_data = users_collection.find_one({field: key})
        if user_data:
            user_data["_id"] = str(user_data["_id"]) 
            return User(**user_data)
        return None  
    except pymongo.errors.PyMongoError as e:
        print(f"Error al buscar el usuario: {e}")
        return None

async def auth_user(token: str = Depends(oauth2)) -> User:
    exception = HTTPException(
        status_code=401, 
        detail="Credenciales de autenticación inválidas", 
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        username = jwt.decode(token, SECRET, algorithms=[ALGORITHM]).get("sub")
        if username is None:
            raise exception
    except JWTError:
        raise exception

    user_data = search_user_db("username", username)
    if not user_data:
        raise exception
    return user_data

async def current_user(user: User = Depends(auth_user)) -> User:
    if user.disable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return user

async def admin_only(user: User = Depends(current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado: Se requieren permisos de administrador"
        )

# Endpoints
# ---------

@router.post("/usuarios/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    if not form.username or not form.password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Faltan campos obligatorios")

    user_data = users_collection.find_one({"username": form.username})
    if not user_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario Incorrecto")
    
    user_data["_id"] = str(user_data["_id"])

    user_obj = User(**user_data)

    if not crypt_context.verify(form.password, user_obj.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Contraseña Incorrecta")

    access_token = {
        "sub": user_obj.username,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_DURATION),
    }

    print(f"Token generado para: {user_obj.username}")

    return {"access_token": jwt.encode(access_token, SECRET, algorithm=ALGORITHM), "token_type": "Bearer"}

@router.get("/usuarios/yo")
async def me(user: UserBase = Depends(current_user)):
    return user

@router.get("/usuarios/verify-token")
async def verify_token(token: str = Depends(oauth2)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user_data = search_user_db("username", username)
        if not user_data:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
        return {"message": "Token válido", "username": username}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
