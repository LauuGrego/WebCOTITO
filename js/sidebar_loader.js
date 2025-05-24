document.addEventListener("DOMContentLoaded", async () => {
  const sidebarCategories = document.getElementById("sidebarCategories");
  const catalogCards = document.getElementById("catalogCards");
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  loadingSpinner.innerHTML = `<div class="spinner"></div>`;
  catalogCards.insertAdjacentElement("afterend", loadingSpinner); // Place spinner after catalog cards

  let currentPage = 1;
  const productsPerPage = 10;
  let isLoading = false;
  let hasMoreProducts = true;

  // Variables globales para filtros activos
  let activeCategory = null;
  let activeType = null;
  let activeSearch = "";
  let restoringState = false;

  // Guardar estado antes de ir a detalles
  function saveCatalogState(productId = null) {
    sessionStorage.setItem('catalogFilters', JSON.stringify({
      activeCategory,
      activeType,
      activeSearch,
      currentPage,
      scrollY: window.scrollY,
      productId
    }));
  }

  // Restaurar estado al volver
  function restoreCatalogState() {
    const state = sessionStorage.getItem('catalogFilters');
    if (state) {
      const { activeCategory: cat, activeType: typ, activeSearch: search, currentPage: _page, scrollY, productId } = JSON.parse(state);
      activeCategory = cat;
      activeType = typ;
      activeSearch = search;
      // Siempre empezar desde la página 1 y cargar hasta encontrar el producto o restaurar scroll
      let page = 1;
      let params = new URLSearchParams();
      if (activeCategory) params.append("category", activeCategory);
      if (activeType) params.append("type", activeType);
      if (activeSearch) params.append("search", activeSearch);

      catalogCards.innerHTML = "";
      document.querySelector('.load-more-button')?.remove();

      // Función recursiva para cargar páginas hasta encontrar el producto o restaurar scroll
      function loadUntilProductOrScroll() {
        loadProductsWithPagination(params.toString(), page).then(() => {
          const el = productId ? document.querySelector(`[data-product-id="${productId}"]`) : null;
          if (el) {
            el.scrollIntoView({ behavior: "auto", block: "center" });
            sessionStorage.removeItem('catalogFilters');
          } else if (typeof scrollY === "number" && !productId) {
            window.scrollTo({ top: scrollY, behavior: "auto" });
            sessionStorage.removeItem('catalogFilters');
          } else {
            // Si hay más productos, cargar la siguiente página
            if (hasMoreProducts) {
              page++;
              loadUntilProductOrScroll();
            } else {
              // Si no se encontró, hacer scroll arriba
              window.scrollTo({ top: 0, behavior: "auto" });
              sessionStorage.removeItem('catalogFilters');
            }
          }
        });
      }

      loadUntilProductOrScroll();
      return true;
    }
    return false;
  }

  // Función para agregar el botón "Ver más"
  function addLoadMoreButton(params) {
    let loadMoreBtn = document.querySelector('.load-more-button');
    if (!loadMoreBtn) {
      loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'load-more-button';
      loadMoreBtn.textContent = 'Ver más';
      loadMoreBtn.addEventListener('click', async () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Cargando...';
        currentPage++;
        await loadProductsWithPagination(params, currentPage);
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Ver más';
      });
      catalogCards.insertAdjacentElement('afterend', loadMoreBtn);
    }
  }

  async function loadProductsWithPagination(params = "", page = 1) {
    if (isLoading || !hasMoreProducts) return;
    isLoading = true;
    loadingSpinner.style.display = "flex"; // Show spinner

    try {
      // Construct the URL properly
      const baseUrl = "https://webcotito.onrender.com/productos/buscar_por_categoria_o_tipo";
      const url = params ? `${baseUrl}?${params}&page=${page}&limit=${productsPerPage}` : `${baseUrl}?page=${page}&limit=${productsPerPage}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      const { products, totalPages } = await response.json();

      // Manejo del botón de paginación
      if (!products || products.length === 0 || page >= totalPages) {
        hasMoreProducts = false;
        document.querySelector('.load-more-button')?.remove();
      } else if (page < totalPages) {
        hasMoreProducts = true;
        addLoadMoreButton(params);
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
                  <button class="ver-detalles-btn" data-product-id="${product.id}">Ver Detalles</button>
                  <a href="https://wa.me/3442664940/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>`;
        catalogCards.insertAdjacentHTML('beforeend', card);
      });

      // Add event listener for "Ver Detalles" buttons
      attachVerDetallesListeners();
    } catch (error) {
      console.error("Error loading products:", error);
      document.querySelector('.load-more-button')?.remove();
    } finally {
      isLoading = false;
      loadingSpinner.style.display = "none"; // Hide spinner
    }
  }

  // Añadir función para listeners de "Ver Detalles"
  function attachVerDetallesListeners() {
    document.querySelectorAll('.ver-detalles-btn').forEach(btn => {
      btn.onclick = (e) => {
        const productId = btn.dataset.productId;
        saveCatalogState(productId);
        window.location.href = `../detalle/detalle.html?id=${productId}`;
      };
    });
  }

  let debounceTimeout;
  const debounce = (func, delay) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
  };

  const searchInput = document.querySelector('.header__search-input');
  searchInput.addEventListener('input', () => {
    debounce(() => {
      activeSearch = searchInput.value.trim();
      currentPage = 1;
      hasMoreProducts = true;
      catalogCards.innerHTML = ""; // Clear catalog for new search
      document.querySelector('.load-more-button')?.remove(); // Remove previous button if any
      // Mantener filtros de categoría y tipo activos
      const params = new URLSearchParams();
      if (activeCategory) params.append("category", activeCategory);
      if (activeType) params.append("type", activeType);
      if (activeSearch) params.append("search", activeSearch);
      loadProductsWithPagination(params.toString(), currentPage);
    }, 300); // 300ms debounce delay
  });

  // Elimina la paginación por scroll: elimina el event listener de scroll
  // window.addEventListener("scroll", () => {
  //   // Si usas paginación con botón, puedes eliminar el scroll infinito o dejarlo como fallback
  //   const scrollThreshold = document.documentElement.scrollHeight - window.innerHeight - 100;
  //   if (window.scrollY >= scrollThreshold && !isLoading) {
  //     currentPage++;
  //     // Usar los filtros activos para la paginación
  //     const params = new URLSearchParams();
  //     if (activeCategory) params.append("category", activeCategory);
  //     if (activeType) params.append("type", activeType);
  //     if (activeSearch) params.append("search", activeSearch);
  //     loadProductsWithPagination(params.toString(), currentPage);
  //   }
  // });

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
        const overlay = document.getElementById("overlay");
        const sidebar = document.querySelector(".sidebar");
        overlay.classList.remove("active"); // Hide overlay
        sidebar.classList.remove("active"); // Close sidebar

        // Guardar filtros activos
        activeCategory = link.dataset.category || null;
        activeType = link.dataset.type || null;
        activeSearch = searchInput.value.trim();

        const params = new URLSearchParams();
        if (activeCategory) params.append("category", activeCategory);
        if (activeType) params.append("type", activeType);
        if (activeSearch) params.append("search", activeSearch);

        try {
            catalogCards.innerHTML = ""; // Clear catalog for new results
            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
            currentPage = 1;
            hasMoreProducts = true;
            document.querySelector('.load-more-button')?.remove(); // Remove previous button if any
            await loadProductsWithPagination(params.toString(), currentPage);
        } catch (error) {
            console.error("Error loading products:", error);
        }
      });
    });
  } catch (error) {
    console.error("Error loading sidebar data:", error);
  }

  // Al cargar la página, restaurar el estado si existe
  document.addEventListener("DOMContentLoaded", () => {
    if (!restoreCatalogState()) {
      loadProductsWithPagination();
    }
  });

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      const overlay = document.getElementById("overlay");
      const sidebar = document.querySelector(".sidebar");
      overlay.classList.remove("active"); // Hide overlay
      sidebar.classList.remove("active"); // Close sidebar
    });
  });
});
