document.addEventListener("DOMContentLoaded", async () => {
  const sidebarCategories = document.getElementById("sidebarCategories");
  const catalogCards = document.getElementById("catalogCards");

  try {
    // Fetch categories
    const categoriesResponse = await fetch("https://webcotito.onrender.com/categorias/listar-public");
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
    const typesResponse = await fetch("https://webcotito.onrender.com/productos/listar/tipos");
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

        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (type) params.append("type", type);

        try {
          const response = await fetch(`https://webcotito.onrender.com/productos/buscar_por_categoria_o_tipo?${params.toString()}`);
          if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
          }
          const products = await response.json();

          // Clear existing products and display new ones
          catalogCards.innerHTML = "";
          products.forEach(product => {
            const imagePath = product.image_path.startsWith("/static/")
              ? product.image_path
              : `/static/${product.image_path}`;
            const formattedPrice = product.price 
              ? product.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
              : "N/A";
            const card = `
              <div class="card">
                <img src="${imagePath}" alt="${product.name}" class="card__image">
                <div class="card__info">
                  <h3 class="card__title">${product.name}</h3>
                  <p class="card__description">${product.description}</p>
                  <div class="card__footer">
                    <span class="card__price">$${formattedPrice}</span>
                    <div class="card__buttons">
                      <button class="ver-detalles-btn" onclick="window.location.href='../../static/detalle/detalle.html?id=${product.id}'">Ver Detalles</button>
                      <a href="https://wa.me/3442664940/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp">WhatsApp</a>
                    </div>
                  </div>
                </div>
              </div>`;
            catalogCards.innerHTML += card;
          });
        } catch (error) {
          console.error("Error loading products:", error);
        }
      });
    });
  } catch (error) {
    console.error("Error loading sidebar data:", error);
  }
});
