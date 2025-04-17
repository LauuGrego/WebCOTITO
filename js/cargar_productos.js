document.addEventListener("DOMContentLoaded", async () => {
    const categorySelect = document.getElementById("category");
    const authToken = localStorage.getItem("authToken"); // Retrieve the token from localStorage

    try {
        const response = await fetch("http://127.0.0.1:8000/categorias/listar-public", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener las categorías.");
        }

        const categories = await response.json();
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id; // Use category ID for backend linkage
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        alert("No se pudieron cargar las categorías.");
    }
});

document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const authToken = localStorage.getItem("authToken"); // Retrieve the token from localStorage

    // Collect sizes as a comma-separated string
    const sizes = Array.from(form.querySelectorAll('input[name="sizes"]:checked'))
        .map((checkbox) => checkbox.value)
        .join(",");
    formData.set("size", sizes);

    // Append images to FormData
    const imageFiles = document.getElementById("image-upload").files;
    Array.from(imageFiles).forEach((file) => {
        formData.append("image", file); // Ensure correct key for backend
    });

    // Debugging: Log the FormData being sent
    console.log("FormData being sent:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/productos/agregar", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            alert(`Error: ${errorData.detail}`);
            return;
        }

        const result = await response.json();
        alert("Producto cargado con éxito");
        console.log("Producto cargado:", result);

        // Optionally reset the form
        form.reset();
        document.getElementById("image-preview").innerHTML = ""; // Clear image previews
    } catch (error) {
        console.error("Error al cargar el producto:", error);
        alert("Ocurrió un error al cargar el producto.");
    }
});

// Handle image preview
function handleFileSelect(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById("image-preview");
    previewContainer.innerHTML = ""; // Clear previous previews

    if (!files.length) {
        const message = document.createElement("p");
        message.textContent = "No se seleccionaron imágenes.";
        previewContainer.appendChild(message);
        return;
    }

    Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
            console.error(`El archivo ${file.name} no es una imagen.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = file.name;
            img.classList.add("preview-image");
            previewContainer.appendChild(img);
        };
        reader.onerror = () => {
            console.error(`Error al leer el archivo ${file.name}.`);
        };
        reader.readAsDataURL(file);
    });
}
