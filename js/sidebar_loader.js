document.addEventListener("DOMContentLoaded", async () => {
  const sidebarCategories = document.getElementById("sidebarCategories");
  const catalogCards = document.getElementById("catalogCards");

  try {
    // Fetch categories
    const categoriesResponse = await fetch("http://127.0.0.1:8000/categorias/listar-public");
    if (!categoriesResponse.ok) {
      throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
    }
    const categories = await categoriesResponse.json();

    // Clear existing content and populate categories
    sidebarCategories.innerHTML = ""; 
    categories.forEach(category => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="sidebar__link" data-category="${category.name}">${category.name}</a>`;
      sidebarCategories.appendChild(li);
    });

    // Fetch product types
    const typesResponse = await fetch("http://127.0.0.1:8000/productos/listar/tipos");
    if (!typesResponse.ok) {
      throw new Error(`Error fetching product types: ${typesResponse.statusText}`);
    }
    const types = await typesResponse.json();

    // Add a title for product types
    const typesTitle = document.createElement("h2");
    typesTitle.classList.add("sidebar__title");
    typesTitle.textContent = "Tipos de Productos";
    sidebarCategories.parentElement.appendChild(typesTitle);

    // Populate types
    const typesList = document.createElement("ul");
    typesList.classList.add("sidebar__list");
    types.forEach(type => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="sidebar__link" data-type="${type}">${type}</a>`;
      typesList.appendChild(li);
    });
    sidebarCategories.parentElement.appendChild(typesList);

    // Add click event listener to sidebar links
    document.querySelectorAll(".sidebar__link").forEach(link => {
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const category = link.dataset.category;
        const type = link.dataset.type;

        let url = "";
        if (category) {
          url = `http://127.0.0.1:8000/productos/buscar?category=${encodeURIComponent(category)}`;
        } else if (type) {
          url = `http://127.0.0.1:8000/productos/buscar?type=${encodeURIComponent(type)}`;
        }

        if (url) {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Error fetching products: ${response.statusText}`);
            }
            const products = await response.json();

            // Clear existing products and display new ones
            catalogCards.innerHTML = "";
            products.forEach(product => {
              const card = `
                <div class="card">
                  <img src="${product.image_path}" alt="${product.name}" class="card__image">
                  <div class="card__info">
                    <h3 class="card__title">${product.name}</h3>
                    <p class="card__description">${product.description}</p>
                    <div class="card__footer">
                      <span class="card__price">$${product.price || "N/A"}</span>
                      <div class="card__buttons">
                        <button class="ver-detalles-btn" onclick="window.location.href='../../static/detalle/detalle.html?id=${product.id}'">Ver Detalles</button>
                        <a href="https://wa.me/3445417684?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp">WhatsApp</a>
                      </div>
                    </div>
                  </div>
                </div>`;
              catalogCards.innerHTML += card;
            });
          } catch (error) {
            console.error("Error loading products:", error);
          }
        }
      });
    });
  } catch (error) {
    console.error("Error loading sidebar data:", error);
  }
});
