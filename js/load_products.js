let currentPage = 1;
const productsPerPage = 10;
let isLoading = false;
let hasMoreProducts = true;

const debounce = (func, delay) => {
  let debounceTimeout;
  return (...args) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func(...args), delay);
  };
};

// Función para cargar productos con paginación
async function loadProducts(searchQuery = '', page = 1) {
    if (isLoading || !hasMoreProducts) return;
    isLoading = true;

    try {
        const response = await fetch(`https://webcotito.onrender.com/productos/listar?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=${productsPerPage}`);
        if (!response.ok) throw new Error('Error al cargar los productos');
        const { products, totalPages } = await response.json();

        if (page >= totalPages) {
            hasMoreProducts = false;
        }

        const catalogCards = document.getElementById('catalogCards');

        if (page === 1) {
            catalogCards.innerHTML = ''; // Limpiar contenido previo solo en la primera página
        }

        if (products.length === 0 && page === 1) {
            catalogCards.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        products.forEach(product => {
            const productImage = product.image_path || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';

            const productCard = `
              <div class="card">
                <img src="${productImage}" alt="${product.name}" class="card__image" />
                <div class="card__info">
                  <h2 class="card__title">${product.name}</h2>
                  <p class="card__description">${product.description}</p>
                  <div class="card__footer">
                    <span class="card__price">$${product.price || 'N/A'}</span>
                    <div class="card__buttons">
                      <button class="ver-detalles-btn" data-product-id="${product.id}">Ver detalles</button>
                      <a href="https://wa.me/3442664940/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp" target="_blank" aria-label="Consultar por WhatsApp">
                        <i class="fab fa-whatsapp"></i> Consultar
                      </a>
                    </div>
                  </div>
                </div>
              </div>`;
            catalogCards.insertAdjacentHTML('beforeend', productCard);
        });

        // Add event listener for "Ver Detalles" buttons
        document.querySelectorAll('.ver-detalles-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                window.location.href = `../detalle/detalle.html?id=${productId}`;
            });
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    } finally {
        isLoading = false;
    }
}

// Detectar scroll para cargar más productos
window.addEventListener("scroll", () => {
    const scrollThreshold = document.documentElement.scrollHeight - window.innerHeight - 100; // Adjusted threshold
    if (window.scrollY >= scrollThreshold && !isLoading) {
        currentPage++;
        const searchInput = document.querySelector('.header__search-input');
        const searchQuery = searchInput ? searchInput.value.trim() : '';
        loadProducts(searchQuery, currentPage);
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.header__search-input');
  loadProducts();

  searchInput.addEventListener('input', debounce(() => {
    const searchQuery = searchInput.value.trim();
    currentPage = 1; // Reset current page when a new search is performed
    hasMoreProducts = true; // Reset hasMoreProducts when a new search is performed
    loadProducts(searchQuery, currentPage);
  }, 300)); // 300ms debounce delay
});
