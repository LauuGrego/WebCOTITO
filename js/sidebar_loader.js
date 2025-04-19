document.addEventListener("DOMContentLoaded", async () => {
  const sidebarCategories = document.getElementById("sidebarCategories");
  const catalogCards = document.getElementById("catalogCards");

  let currentPage = 1;
  const productsPerPage = 10;
  let isLoading = false;
  let hasMoreProducts = true;

  async function loadProductsWithPagination(params = "", page = 1) {
    if (isLoading || !hasMoreProducts) return;
    isLoading = true;

    try {
      const response = await fetch(`https://webcotito.onrender.com/productos/buscar_por_categoria_o_tipo?${params}&page=${page}&limit=${productsPerPage}`);
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      const { products, totalPages } = await response.json();

      if (page >= totalPages) {
        hasMoreProducts = false;
      }

      products.forEach(product => {
        const imagePath = product.image_path || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
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
        catalogCards.insertAdjacentHTML('beforeend', card);
      });
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      isLoading = false;
    }
  }

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
      currentPage++;
      const params = new URLSearchParams();
      const activeCategory = document.querySelector(".sidebar__link[data-category].active");
      const activeType = document.querySelector(".sidebar__link[data-type].active");

      if (activeCategory) params.append("category", activeCategory.dataset.category);
      if (activeType) params.append("type", activeType.dataset.type);

      loadProductsWithPagination(params.toString(), currentPage);
    }
  });

  try {
    const categoriesResponse = await fetch("https://webcotito.onrender.com/categorias/listar-public");
    if (!categoriesResponse.ok) {
      throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
    }
    const categories = await categoriesResponse.json();

    sidebarCategories.innerHTML = ""; 
    categories.forEach(category => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="sidebar__link" data-category="${category.name}">${category.name}</a>`;
      sidebarCategories.appendChild(li);
    });

    const typesResponse = await fetch("https://webcotito.onrender.com/productos/listar/tipos");
    if (!typesResponse.ok) {
      throw new Error(`Error fetching product types: ${typesResponse.statusText}`);
    }
    const types = await typesResponse.json();

    const typesTitle = document.createElement("h2");
    typesTitle.classList.add("sidebar__title");
    typesTitle.textContent = "Tipos de Productos";
    sidebarCategories.parentElement.appendChild(typesTitle);

    const typesList = document.createElement("ul");
    typesList.classList.add("sidebar__list");
    types.forEach(type => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="sidebar__link" data-type="${type}">${type}</a>`;
      typesList.appendChild(li);
    });
    sidebarCategories.parentElement.appendChild(typesList);

    document.querySelectorAll(".sidebar__link").forEach(link => {
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const category = link.dataset.category;
        const type = link.dataset.type;

        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (type) params.append("type", type);

        try {
          catalogCards.innerHTML = "";
          currentPage = 1;
          hasMoreProducts = true;
          loadProductsWithPagination(params.toString(), currentPage);
        } catch (error) {
          console.error("Error loading products:", error);
        }
      });
    });
  } catch (error) {
    console.error("Error loading sidebar data:", error);
  }

  loadProductsWithPagination();
});
