// Agrega al archivo JS existente
function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
  }
  
  function handleFiles(files) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const div = document.createElement('div');
          div.className = 'preview-image';
          div.innerHTML = `
            <img src="${e.target.result}" alt="Previsualización">
            <button type="button" class="remove-image" onclick="removeImage(this)">&times;</button>
          `;
          preview.appendChild(div);
        };
        
        reader.readAsDataURL(file);
      }
    }
  }
  
  function removeImage(button) {
    button.parentElement.remove();
  }
  
  // Drag and drop
  const dropZone = document.getElementById('drop-zone');
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });