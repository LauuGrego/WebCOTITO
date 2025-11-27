from fastapi import FastAPI
from app.routes import products, users, categories, users_JWT_auth, cart, sitemap
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las fuentes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los encabezados
)

# Serve static files
#app.mount("/static/images", StaticFiles(directory="static/images"), name="static_images")

app.include_router(products.router)

app.include_router(categories.router)

app.include_router(users.router)

app.include_router(users_JWT_auth.router)

app.include_router(cart.router)

app.include_router(sitemap.router)

@app.head("/monitor")
async def monitor():
    return {"status": "ok"}

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

# Configuration       
cloudinary.config( 
    cloud_name = "dotxvd5dc", 
    api_key = "494187312773391", 
    api_secret = "dxD8oLE73v6EYbyPT9yGfyhD5sE", # Click 'View API Keys' above to copy your API secret
    secure=True
)
