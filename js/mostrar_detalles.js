document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("detalle-container");

  if (!contenedor) {
      console.error("No se encontró el contenedor con ID 'detalle-container'.");
      return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
      contenedor.innerHTML = "<p class='error-mensaje'>ID de producto no especificado.</p>";
      return;
  }

  // Base de datos simulada (debe coincidir con los productos del catálogo)
  const productos = {
      1: {
          nombre: "Conjunto Infantil",
          descripcion: "Conjunto cómodo y elegante para los más pequeños. Fabricado con materiales 100% algodón para máxima suavidad y comodidad. Ideal para uso diario o ocasiones especiales.",
          precio: "$29.99",
          imagen: "../../images/conjunto1.jpg",
          categoria: "Ropa Bebé"
      },
      2: {
          nombre: "Monito Clásico",
          descripcion: "Diseño único con detalles artesanales. Resistente y fácil de lavar, perfecto para el día a día. Disponible en varios colores y tallas.",
          precio: "$34.99",
          imagen: "../../images/monito1.jpg",
          categoria: "Ropa Niños"
      },
      3: {
          nombre: "Vestido Elegante",
          descripcion: "Vestido con detalles florales y corte moderno. Hecho con tejidos transpirables para mayor comodidad en cualquier estación.",
          precio: "$39.99",
          imagen: "../../images/vestido1.jpeg",
          categoria: "Ropa Niños"
      },
      4: {
          nombre: "Conjunto Deportivo",
          descripcion: "Ropa cómoda y moderna, perfecta para actividades físicas o uso casual. Diseñado para permitir libertad de movimiento.",
          precio: "$39.99",
          imagen: "../../images/niño1.png",
          categoria: "Ropa Niños"
      },
      5: {
          nombre: "Vestido de Verano",
          descripcion: "Ligero y fresco, ideal para los días calurosos. Con bolsillos prácticos y diseños alegres que a los niños les encantarán.",
          precio: "$39.99",
          imagen: "../../images/niña1.jpg",
          categoria: "Ropa Niños"
      }
  };

  const producto = productos[id];

  if (producto) {
      contenedor.innerHTML = `
          <div class="producto-detalle">
              <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" />
              <div class="producto-info">
                  <span class="producto-categoria">${producto.categoria}</span>
                  <h1 class="producto-titulo">${producto.nombre}</h1>
                  <p class="producto-descripcion">${producto.descripcion}</p>
                  <p class="producto-precio">${producto.precio}</p>
                  <div class="producto-acciones">
                      <a href="https://wa.me/?text=Hola,%20estoy%20interesado%20en%20${encodeURIComponent(producto.nombre)}" 
                         class="boton-whatsapp" target="_blank">
                          <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                      </a>
                      <button onclick="window.history.back()" class="boton-volver">
                          <i class="fas fa-arrow-left"></i> Volver al Catálogo
                      </button>
                  </div>
              </div>
          </div>
      `;
  } else {
      contenedor.innerHTML = "<p class='error-mensaje'>Producto no encontrado.</p>";
  }
});