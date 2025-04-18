async function loadProducts(searchQuery = '') {
  try {
    const response = await fetch(`https://webcotito.onrender.com/productos/listar?search=${encodeURIComponent(searchQuery)}`);
    if (!response.ok) throw new Error('Error al cargar los productos');
    const products = await response.json();

    const catalogCards = document.getElementById('catalogCards');
    catalogCards.innerHTML = ''; // Limpiar contenido previo

    if (products.length === 0) {
      catalogCards.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }

    products.forEach(product => {
      const productImage = product.image_path
        ? product.image_path
        : '/static/images/default-product.jpg'; // Default image fallback

      const productCard = `
        <div class="card">
          <img src="${productImage}" alt="${product.name}" class="card__image" />
          <div class="card__info">
            <h2 class="card__title">${product.name}</h2>
            <p class="card__description">${product.description}</p>
            <div class="card__footer">
              <span class="card__price">$${product.price || 'N/A'}</span>
              <div class="card__buttons">
                <button class="ver-detalles-btn" data-producto-id="${product.id}">Ver detalles</button>
                <a href="https://wa.me/3442664940/?text=¡Hola! Quiero saber más info acerca de ${product.name}." class="card__whatsapp" target="_blank" aria-label="Consultar por WhatsApp">
                  <i class="fab fa-whatsapp"></i> Consultar
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      catalogCards.insertAdjacentHTML('beforeend', productCard);
    });

    // Add event listener for "Ver detalles" buttons
    document.querySelectorAll('.ver-detalles-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const productId = event.target.dataset.productoId;
        window.location.href = `../../static/detalle/detalle.html?id=${productId}`;
      });
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.header__search-input');
  loadProducts();

  searchInput.addEventListener('input', () => {
    const searchQuery = searchInput.value;
    loadProducts(searchQuery);
  });
});
