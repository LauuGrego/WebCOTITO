from fastapi import FastAPI
from app.routes import products, users, categories, users_JWT_auth, cart
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
app.mount("/static/images", StaticFiles(directory="static/images"), name="static_images")

app.include_router(products.router)

app.include_router(categories.router)

app.include_router(users.router)

app.include_router(users_JWT_auth.router)

app.include_router(cart.router)

@app.head("/monitor")
async def monitor():
    return {"status": "ok"}


