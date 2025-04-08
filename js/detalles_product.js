document.addEventListener('DOMContentLoaded', function() {
  // Manejar clic en botones "Ver detalles"
  const botonesDetalles = document.querySelectorAll('.ver-detalles-btn');
  
  botonesDetalles.forEach(boton => {
      boton.addEventListener('click', function() {
          const productoId = this.getAttribute('data-producto-id');
          // Redirigir a la página de detalles con el ID del producto
          window.location.href = `../detalle/detalle.html?id=${productoId}`;
      });
  });
});