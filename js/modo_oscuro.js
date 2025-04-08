document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Verificar preferencia del sistema o localStorage
    const currentTheme = localStorage.getItem('theme') || 
                       (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    
    // Alternar modo oscuro
    darkModeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      updateDarkModeIcon();
    });
    
    // Actualizar icono según el tema
    function updateDarkModeIcon() {
      const isDark = document.body.classList.contains('dark-mode');
      document.querySelector('.moon-icon').style.display = isDark ? 'none' : 'block';
      document.querySelector('.sun-icon').style.display = isDark ? 'block' : 'none';
    }
    
    // Observar cambios en el tema del sistema
    prefersDarkScheme.addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        document.body.classList.toggle('dark-mode', e.matches);
        updateDarkModeIcon();
      }
    });
    
    updateDarkModeIcon();
  });