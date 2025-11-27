from fastapi import APIRouter, Response
from app.db.client import db_client
from datetime import datetime

router = APIRouter()

@router.get("/sitemap.xml", response_class=Response)
async def get_sitemap():
    base_url = "https://webcotito.onrender.com"
    
    # Static URLs
    urls = [
        {"loc": f"{base_url}/", "priority": "1.0"},
        {"loc": f"{base_url}/static/catalogo/catalogo.html", "priority": "0.8"},
    ]
    
    # Dynamic URLs (Products)
    products_collection = db_client.products
    products = products_collection.find({}, {"_id": 1})
    
    for product in products:
        urls.append({
            "loc": f"{base_url}/static/detalle/detalle.html?id={str(product['_id'])}",
            "priority": "0.6"
        })
        
    # Generate XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\n'
        # Optional: Add lastmod if available, or changefreq
        xml_content += '    <changefreq>weekly</changefreq>\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\n'
        xml_content += '  </url>\n'
        
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")
