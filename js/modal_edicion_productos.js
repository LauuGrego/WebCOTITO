 // Datos de ejemplo
 let products = [
    {
      name: "Remera Algodón",
      category: "Indumentaria",
      type: "Camiseta",
      stock: 50,
      description: "Remera 100% algodón",
      price: 2000,
      sizes: ["S", "M", "L"]
    },
    {
      name: "Pantalón Jeans",
      category: "Indumentaria",
      type: "Pantalón",
      stock: 30,
      price: 3500,
      description: "Pantalón clásico de mezclilla",
      sizes: ["M", "L", "XL"]
    }
  ];

  // Función para renderizar la tabla de productos
  function renderProducts() {
      const tbody = document.querySelector('.products-table tbody');
      tbody.innerHTML = ""; // Limpiar contenido previo

      products.forEach((product, index) => {
          // Crear la fila con los datos del producto
          const row = document.createElement('tr');
          row.innerHTML = `
                <td data-label="Nombre">${product.name}</td>
                <td data-label="Categoria">${product.category}</td>
                <td data-label="Precio">$${product.price}</td>
                <td data-label="Stock">${product.stock}</td>
                <td data-label="Acciones" class="actions">
                  <button class="btn-edit" onclick="openEditModal(${index})">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-delete" onclick="deleteProduct(${index})">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          `;
          tbody.appendChild(row);
      });
  }

  // Abrir modal para editar y rellenar el formulario con los datos del producto seleccionado
  function openEditModal(index) {
      const product = products[index];
      const form = document.getElementById('editForm');

      // Rellenar el formulario con los datos del producto
      form.elements.name.value = product.name;
      form.elements.category.value = product.category;
      form.elements.type.value = product.type;
      form.elements.stock.value = product.stock;
      form.elements.description.value = product.description;

      // Marcar los talles seleccionados
      document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
          checkbox.checked = product.sizes.includes(checkbox.value);
      });

      document.getElementById('editModal').style.display = 'block';
  }

  // Cerrar modal de edición
  function closeEditModal() {
      document.getElementById('editModal').style.display = 'none';
  }

  // Eliminar producto y actualizar la tabla
  function deleteProduct(index) {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
          // Eliminar producto del array
          products.splice(index, 1);
          // Volver a renderizar la tabla actualizando el DOM
          renderProducts();
      }
  }

  // Cerrar el modal si se hace click fuera del contenido del modal
  window.onclick = function(event) {
      const modal = document.getElementById('editModal');
      if (event.target == modal) {
          modal.style.display = 'none';
      }
  }

  // Al cargar el DOM, renderizamos el listado de productos
  document.addEventListener('DOMContentLoaded', renderProducts);