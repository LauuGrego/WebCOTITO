
        // Datos de ejemplo
        let products = [
            {
                name: "Remera Algodón",
                category: "Indumentaria",
                type: "Camiseta",
                stock: 50,
                description: "Remera 100% algodón",
                sizes: ["S", "M", "L"]
            }
        ];

        function openEditModal(index) {
            const product = products[index];
            const form = document.getElementById('editForm');
            
            // Rellenar formulario con datos del producto
            form.elements.name.value = product.name;
            form.elements.category.value = product.category;
            form.elements.type.value = product.type;
            form.elements.stock.value = product.stock;
            form.elements.description.value = product.description;
            
            // Marcar talles seleccionados
            document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
                checkbox.checked = product.sizes.includes(checkbox.value);
            });

            document.getElementById('editModal').style.display = 'block';
        }

        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }

        function deleteProduct(index) {
            if(confirm('¿Estás seguro de eliminar este producto?')) {
                // Lógica para eliminar producto
                products.splice(index, 1);
                // Actualizar tabla
                location.reload(); // En realidad deberías actualizar el DOM
            }
        }

        // Cerrar modal al hacer click fuera
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    