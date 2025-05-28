document.addEventListener('DOMContentLoaded', () => {
    const modal       = document.getElementById('loginModal');
    const overlay     = document.getElementById('modalOverlay');
    const btnClose    = document.getElementById('closeModal');
    const btnOpens    = document.querySelectorAll('.open-login-modal');
    const loginForm   = document.querySelector('.login-form');

    btnOpens.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const mobileOverlay = document.getElementById('overlay');
            mobileOverlay.classList.remove('active');
            document.body.classList.remove('nav-open');
            modal.classList.add('show');
        });
    });

    btnClose.addEventListener('click', () => modal.classList.remove('show'));
    overlay.addEventListener('click', () => modal.classList.remove('show'));

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('modal-user').value;
        const password = document.getElementById('modal-password').value;

        // Add loading indicator
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Cargando...';

        try {
            const response = await fetch('https://webcotito-production.up.railway.app/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error en el inicio de sesión');
            }

            const data = await response.json();
            localStorage.setItem('access_token', data.access_token); // Guardar token en localStorage

            // Verify user details after login
            const userResponse = await fetch('https://webcotito-production.up.railway.app/usuarios/yo', {
                method: 'GET',
                headers: { Authorization: `Bearer ${data.access_token}` }
            });

            if (userResponse.ok) {
                alert('Inicio de sesión exitoso');
                modal.classList.remove('show'); // Cerrar modal
                window.location.href = '/static/editor/agregar_producto.html'; // Redirect on success
            } else {
                throw new Error('Error al validar las credenciales.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Credenciales incorrectas o error en el servidor');
        } finally {
            // Remove loading indicator
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar sesión';
        }
    });
});
