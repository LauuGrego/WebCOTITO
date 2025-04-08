document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openLoginModal');
    const modal   = document.getElementById('loginModal');
    const closeBtn= document.getElementById('closeModal');
    const overlay = document.getElementById('modalOverlay');
  
    function toggleModal() {
      modal.classList.toggle('show');
    }
  
    openBtn.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', toggleModal);
    overlay.addEventListener('click', toggleModal);
  
    // Evita que click dentro del contenido cierre el modal
    document.querySelector('.modal__content')
      .addEventListener('click', e => e.stopPropagation());
  });
  