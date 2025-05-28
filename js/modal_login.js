document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openLoginModal');
    const modal   = document.getElementById('loginModal');
    const closeBtn= document.getElementById('closeModal');
    const overlay = document.getElementById('modalOverlay');
    const loginForm = document.querySelector('.login-form'); // Formulario de login

    function toggleModal() {
        modal.classList.toggle('show');
    }

    openBtn.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', toggleModal);
    overlay.addEventListener('click', toggleModal);

    // Evita que click dentro del contenido cierre el modal
    document.querySelector('.modal__content')
        .addEventListener('click', e => e.stopPropagation());

    // Manejar el envío del formulario de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await fetch('webcotito-production.up.railway.app/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales incorrectas');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token); // Store token in localStorage with the key 'authToken'

            alert('Inicio de sesión exitoso');
            window.location.href = '/static/editor/agregar_producto.html'; // Redirigir al dashboard
        } catch (error) {
            alert(error.message);
        }
    });
});
