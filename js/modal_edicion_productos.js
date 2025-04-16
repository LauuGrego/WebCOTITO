// Función para obtener productos desde el backend
async function fetchProducts() {
    try {
        const response = await fetch('http://127.0.0.1:8000/productos/listar', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para renderizar la tabla de productos
function renderProducts(products) {
    const tbody = document.querySelector('.products-table tbody');
    tbody.innerHTML = ""; // Limpiar contenido previo

    products.forEach(async product => {
        const categoryName = await fetchCategoryName(product.category_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${categoryName}</td>
            <td>${product.type}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn-edit" onclick="openEditModal('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="disableProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para obtener el nombre de la categoría por ID
async function fetchCategoryName(categoryId) {
    try {
        console.log(`Fetching category name for ID: ${categoryId}`);
        const response = await fetch(`http://127.0.0.1:8000/categorias/buscar-por-id/${categoryId}`, {
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
        const response = await fetch('http://127.0.0.1:8000/categorias/listar-public', {
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
        const response = await fetch(`http://127.0.0.1:8000/productos/obtener_por_id/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener los datos del producto');
        }
        const product = await response.json();
        const form = document.getElementById('editForm');

        // Llenar el select de categorías y marcar la categoría actual del producto
        await populateCategorySelect(product.category_id);

        // Rellenar el formulario con los datos del producto
        form.elements.name.value = product.name;
        form.elements.type.value = product.type;
        form.elements.stock.value = product.stock;
        form.elements.description.value = product.description;

        // Mostrar la imagen actual del producto
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = ""; // Limpiar previsualización previa
        if (product.image) {
            const img = document.createElement('img');
            img.src = product.image;
            img.alt = "Imagen actual del producto";
            img.classList.add('preview-image');
            imagePreview.appendChild(img);
        }

        // Marcar los talles seleccionados
        document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
            checkbox.checked = product.size.includes(checkbox.value);
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

// Guardar cambios del producto (incluyendo categoría)
async function saveProductChanges(event) {
    event.preventDefault();
    const form = event.target;
    const productId = form.dataset.productId;

    const formData = new FormData(form);
    const imageInput = document.getElementById('productImageInput');
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    // Add the selected category ID to the form data
    const categorySelect = document.getElementById('category');
    if (categorySelect.value) {
        formData.append('category_name', categorySelect.options[categorySelect.selectedIndex].text);
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/productos/actualizar/${productId}`, {
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

// Deshabilitar producto
async function disableProduct(productId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/productos/deshabilitar/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al deshabilitar el producto');
        }
        alert('Producto deshabilitado con éxito');
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
    fetchProducts();
    document.getElementById('editForm').addEventListener('submit', saveProductChanges);
});