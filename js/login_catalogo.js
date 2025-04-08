document.addEventListener('DOMContentLoaded', () => {
    const modal       = document.getElementById('loginModal');
    const overlay     = document.getElementById('modalOverlay');
    const btnClose    = document.getElementById('closeModal');
    // ahora seleccionamos TODOS los triggers
    const btnOpens    = document.querySelectorAll('.open-login-modal');
  
    btnOpens.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        // cerramos menú móvil si estuviera abierto
        const mobileOverlay = document.getElementById('overlay');
        mobileOverlay.classList.remove('active');
        document.body.classList.remove('nav-open');
        
        // abrimos modal
        modal.classList.add('show');
      });
    });
  
    btnClose.addEventListener('click', () => modal.classList.remove('show'));
    overlay.addEventListener('click', () => modal.classList.remove('show'));
  });
  