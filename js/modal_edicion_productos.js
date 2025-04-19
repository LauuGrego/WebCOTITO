// Función para obtener productos desde el backend
let currentPage = 1;
const productsPerPage = 10;
let isLoading = false; // Evitar múltiples solicitudes simultáneas

// Función para obtener productos con paginación
async function fetchProducts(page = 1, append = false) {
    try {
        if (isLoading) return; // Evitar múltiples solicitudes
        isLoading = true;

        const response = await fetch(`https://webcotito.onrender.com/productos/listar?page=${page}&limit=${productsPerPage}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const { products, totalPages } = await response.json();
        renderProducts(products, append);
        renderPagination(totalPages, page);
        isLoading = false;
    } catch (error) {
        console.error('Error:', error);
        isLoading = false;
    }
}

// Función para renderizar la paginación
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ""; // Limpiar paginación previa

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-button');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            fetchProducts(i);
        });
        paginationContainer.appendChild(button);
    }
}

// Función para renderizar la tabla de productos (optimizada)
function renderProducts(products, append = false) {
    const tbody = document.querySelector('.products-table tbody');
    if (!append) {
        tbody.innerHTML = ""; // Limpiar contenido previo si no se está agregando
    }

    const rows = products.map(product => {
        const imageUrl = product.image_path || 'https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg';
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.category_name || 'Sin categoría'}</td>
                <td>${product.type}</td>
                <td>${product.stock}</td>
                <td>
                    <img src="${imageUrl}" alt="Imagen del producto" class="product-preview">
                </td>
                <td>
                    <button class="btn-edit" onclick="openEditModal('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    tbody.insertAdjacentHTML('beforeend', rows);
}

// Función para obtener el nombre de la categoría por ID
async function fetchCategoryName(categoryId) {
    try {
        console.log(`Fetching category name for ID: ${categoryId}`);
        const response = await fetch(`https://webcotito.onrender.com/categorias/buscar-por-id/${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Categoría con ID ${categoryId} no encontrada.`);
                return 'Sin categoría';
            }
            throw new Error(`Error al obtener el nombre de la categoría: ${response.statusText}`);
        }
        const category = await response.json();
        console.log(`Category name fetched: ${category.name}`);
        return category.name || 'Sin categoría';
    } catch (error) {
        console.error(`Error fetching category name for ID ${categoryId}:`, error);
        return 'Sin categoría';
    }
}

// Función para obtener y listar las categorías en el select del modal
async function populateCategorySelect(selectedCategoryId = null) {
    try {
        const response = await fetch('https://webcotito.onrender.com/categorias/listar-public', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener las categorías');
        }
        const categories = await response.json();
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Seleccionar...</option>'; // Limpiar opciones previas

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id; // Use the category ID as the value
            option.textContent = category.name;

            // Marcar como seleccionada si coincide con la categoría del producto
            if (selectedCategoryId && category.id === selectedCategoryId) {
                option.selected = true;
            }

            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Abrir modal para editar y rellenar el formulario con los datos del producto seleccionado
async function openEditModal(productId) {
    try {
        const response = await fetch(`https://webcotito.onrender.com/productos/obtener_por_id/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener los datos del producto');
        }
        const product = await response.json();
        const form = document.getElementById('editForm');

        // Clear previous data in the form
        form.reset();

        // Llenar el select de categorías y marcar la categoría actual del producto
        await populateCategorySelect(product.category_id);

        // Rellenar el formulario con los datos del producto
        form.elements.name.value = product.name;
        form.elements.type.value = product.type;
        form.elements.stock.value = product.stock;
        form.elements.price.value = product.price; // Preselect the price
        form.elements.description.value = product.description;

        // Mostrar la imagen actual del producto
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = ""; // Limpiar previsualización previa
        if (product.image_path) {
            const img = document.createElement('img');
            img.src = product.image_path;
            img.alt = "Imagen actual del producto";
            img.classList.add('preview-image');
            imagePreview.appendChild(img);
        }

        // Actualizar los talles seleccionados
        const productSizes = Array.isArray(product.size) ? product.size.map(size => size.toUpperCase()) : [];
        document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
            checkbox.checked = productSizes.includes(checkbox.value.toUpperCase()); // Mark current sizes as selected
        });

        form.dataset.productId = productId; // Guardar el ID del producto en el formulario
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cerrar modal de edición
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Configuración de Cloudinary
const CLOUD_NAME = "dotxvd5dc"; // ← reemplazar con tu Cloud Name
const UPLOAD_PRESET = "cotito_images"; // ← reemplazar con tu Upload Preset

async function uploadImageToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) throw new Error("Error al subir imagen a Cloudinary");

    const data = await response.json();
    return data.secure_url;
}

// Guardar cambios del producto (incluyendo categoría)
async function saveProductChanges(event) {
    event.preventDefault();
    const form = event.target;
    const productId = form.dataset.productId;

    const formData = new FormData(form);
    const priceInput = form.elements.price.value.replace(/\./g, '').replace(',', '.'); // Convert to backend format
    if (priceInput) {
        formData.set('price', parseFloat(priceInput).toFixed(2));
    }

    // Subir imagen a Cloudinary si se seleccionó una nueva
    const imageInput = document.getElementById('productImageInput');
    if (imageInput.files.length > 0) {
        try {
            const imageUrl = await uploadImageToCloudinary(imageInput.files[0]);
            formData.set('image_url', imageUrl); // Enviar solo la URL al backend
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            alert("Ocurrió un error al subir la imagen.");
            return;
        }
    }

    // Add the selected category ID to the form data
    const categorySelect = document.getElementById('category');
    if (categorySelect.value) {
        formData.append('category_name', categorySelect.options[categorySelect.selectedIndex].text);
    }

    // Collect selected sizes
    const selectedSizes = Array.from(document.querySelectorAll('input[name="sizes"]:checked'))
        .map(checkbox => checkbox.value);
    if (selectedSizes.length > 0) {
        formData.set('size', selectedSizes.join(',')); // Send sizes as a comma-separated string
    }

    try {
        const response = await fetch(`https://webcotito.onrender.com/productos/actualizar/${productId}`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al actualizar el producto');
        }
        alert('Producto actualizado con éxito');
        closeEditModal();
        fetchProducts(); // Actualizar la lista de productos
    } catch (error) {
        console.error('Error:', error);
    }
}

// Eliminar producto con confirmación
async function deleteProduct(productId) {
    const confirmation = confirm("¿Está seguro que desea eliminar este producto?");
    if (!confirmation) return; // Cancelar si el usuario no confirma

    try {
        const response = await fetch(`https://webcotito.onrender.com/productos/eliminar/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }
        alert('Producto eliminado con éxito');
        fetchProducts(); // Actualizar la lista de productos
    } catch (error) {
        console.error('Error:', error);
    }
}

// Previsualizar imagen cargada
document.getElementById('productImageInput').addEventListener('change', function(event) {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = ""; // Limpiar previsualización previa

    Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('preview-image');
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Cerrar el modal si se hace click fuera del contenido del modal
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Al cargar el DOM, obtener y renderizar los productos
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(currentPage);
    document.getElementById('editForm').addEventListener('submit', saveProductChanges);
});

// Función para buscar productos (optimizada)
async function searchProducts(searchTerm) {
    try {
        const response = await fetch(`https://webcotito.onrender.com/productos/listar?search=${encodeURIComponent(searchTerm)}&limit=${productsPerPage}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al buscar los productos');
        }
        const { products } = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Evento para la barra de búsqueda (optimizado)
document.querySelector('.header__search-input').addEventListener('input', debounce(function (event) {
    const searchTerm = event.target.value.trim();
    if (searchTerm === "") {
        fetchProducts(); // Mostrar todos los productos si el campo está vacío
    } else {
        searchProducts(searchTerm); // Buscar productos por el término ingresado
    }
}, 300));

// Función de debounce para limitar la frecuencia de ejecución
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Agregar evento de scroll infinito
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
        currentPage++;
        fetchProducts(currentPage, true); // Cargar más productos y agregarlos
    }
});