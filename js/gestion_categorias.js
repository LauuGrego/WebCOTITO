document.addEventListener("DOMContentLoaded", () => {
    const categoryForm = document.getElementById("categoryForm");
    const categoryList = document.getElementById("categoryList");

    // Simulated categories (replace with backend integration)
    let categories = ["Indumentaria", "Calzado", "Accesorios"];

    // Render categories
    function renderCategories() {
        categoryList.innerHTML = "";
        categories.forEach((category, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category}</td>
                <td>
                    <button class="btn-delete" onclick="deleteCategory(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            categoryList.appendChild(row);
        });
    }

    // Add new category
    categoryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const categoryName = document.getElementById("categoryName").value.trim();
        if (categoryName) {
            categories.push(categoryName);
            renderCategories();
            categoryForm.reset();
        }
    });

    // Delete category
    window.deleteCategory = (index) => {
        categories.splice(index, 1);
        renderCategories();
    };

    // Initial render
    renderCategories();
});
