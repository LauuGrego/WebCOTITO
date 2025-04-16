from fastapi import APIRouter, HTTPException, Depends
from app.models.category import Category, CategoryBase, CategoryCreate
from .users_JWT_auth import admin_only
from app.models.user import User
from app.db.client import db_client
from bson import ObjectId

router = APIRouter(prefix="/categorias", tags=["Categories"])

# Colección de categorías
categories_collection = db_client.categories

@router.post("/agregar", status_code=201)
async def create_category(category: CategoryCreate, admin: User = Depends(admin_only)):
    category.name = category.name.title().strip()

    if categories_collection.find_one({"name": category.name}):
        raise HTTPException(status_code=400, detail="La categoría ya existe.")

    new_category = {"name": category.name}
    result = categories_collection.insert_one(new_category)

    new_category["_id"] = str(result.inserted_id)
    return new_category

@router.get("/listar")
async def list_categories(admin: User = Depends(admin_only) ):
    
    categories = list(categories_collection.find({}, {"_id": 0, "name": 1}))
    return categories

@router.get("/listar-public")
async def list_categories():
    categories = list(categories_collection.find({}, {"_id": 1, "name": 1}))
    for category in categories:
        category["id"] = str(category["_id"])  # Convert ObjectId to string
        del category["_id"]  # Remove the original _id field
    return categories

@router.delete("/eliminar/{category_name}")
async def delete_category_by_name(category_name: str, admin: User = Depends(admin_only)):
    category_name = category_name.title().strip()

    result = categories_collection.delete_one({"name": category_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    return {"detail": f"La categoría '{category_name}' fue eliminada con éxito."}

@router.get("/buscar/{category_name}")
async def search_categories_by_name(category_name: str):
    category_name = category_name.title().strip()

    matching_categories = list(
        categories_collection.find({"name": {"$regex": category_name, "$options": "i"}})
    )
    if not matching_categories:
        raise HTTPException(status_code=404, detail="No se encontraron categorías que coincidan con la búsqueda.")
    
    for category in matching_categories:
        category["_id"] = str(category["_id"])
    return matching_categories

@router.get("/buscar-por-id/{category_id}")
async def get_category_by_id(category_id: str):
    # Log the incoming category_id
    print(f"Received category_id: {category_id}")

    # Validate the ObjectId
    if not ObjectId.is_valid(category_id):
        print(f"Invalid ObjectId: {category_id}")
        raise HTTPException(status_code=400, detail="ID de categoría no válido.")
    
    # Search for the category in the database
    category = categories_collection.find_one({"_id": ObjectId(category_id)}, {"_id": 0, "name": 1})
    if not category:
        print(f"No category found for ID: {category_id}")
        raise HTTPException(status_code=404, detail=f"Categoría con ID {category_id} no encontrada.")
    
    print(f"Category found: {category}")
    return {"name": category["name"]}
