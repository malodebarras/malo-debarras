document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // On arrête d’observer après apparition
      }
    });
  }, {
    threshold: 0.1
  });

  sections.forEach(section => {
    observer.observe(section);
  });
});

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;

      // Toggle l'état actif
      item.classList.toggle('active');
    });
  });





// ===== CONFIGURATION CLOUDINARY =====
const CLOUDINARY_CONFIG = {
  cloudName: "dql4x11q8",
  uploadPreset: "malo_debarras"
};

let uploadedImages = [];

// ===== QUAND ON SÉLECTIONNE DES FICHIERS =====
document.getElementById('c-photos').addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

// ===== DRAG & DROP SUR LE BOUTON =====
const uploadBtn = document.getElementById('upload-btn');

uploadBtn.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBtn.style.backgroundColor = '#e67e1a';
});

uploadBtn.addEventListener('dragleave', () => {
  uploadBtn.style.backgroundColor = '#fb8c27';
});

uploadBtn.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBtn.style.backgroundColor = '#fb8c27';
  handleFiles(e.dataTransfer.files);
});

// ===== UPLOAD FILES TO CLOUDINARY =====
async function handleFiles(files) {
  if (files.length === 0) return;

  if (!CLOUDINARY_CONFIG.cloudName || CLOUDINARY_CONFIG.cloudName === "YOUR_CLOUD_NAME") {
    document.getElementById('upload-status').innerHTML = '⚠️ Veuillez configurer Cloudinary dans le script';
    document.getElementById('upload-status').style.color = 'red';
    return;
  }

  document.getElementById('upload-status').innerHTML = '⏳ Envoi en cours...';
  document.getElementById('upload-status').style.color = '#666';

  for (let file of files) {
    if (file.size > 100 * 1024 * 1024) {
      document.getElementById('upload-status').innerHTML += `<p>❌ ${file.name} est trop volumineux (max 100MB)</p>`;
      continue;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        uploadedImages.push(data.secure_url);
        addPreview(file, data.secure_url);
        document.getElementById('upload-status').innerHTML = `✅ ${uploadedImages.length} photo(s) ajoutée(s)`;
        document.getElementById('upload-status').style.color = '#1CBF73';
        document.getElementById('image_links').value = uploadedImages.join('\n');
      } else {
        document.getElementById('upload-status').innerHTML += `<p>❌ Erreur : ${data.error?.message || 'Envoi échoué'}</p>`;
      }
    } catch (error) {
      document.getElementById('upload-status').innerHTML += `<p>❌ Erreur réseau</p>`;
      console.error('Upload error:', error);
    }
  }
}

// ===== PREVIEW DES FICHIERS =====
function addPreview(file, url) {
  const previewItem = document.createElement('div');
  previewItem.className = 'preview-item';

  const isVideo = file.type.startsWith('video/');

  if (isVideo) {
    previewItem.innerHTML = `
      <video src="${url}"></video>
      <span class="video-badge">🎥</span>
      <button type="button" class="preview-delete" aria-label="Supprimer">×</button>
    `;
  } else {
    previewItem.innerHTML = `
      <img src="${url}" alt="Aperçu photo">
      <button type="button" class="preview-delete" aria-label="Supprimer">×</button>
    `;
  }

  previewItem.querySelector('.preview-delete').addEventListener('click', () => {
    uploadedImages = uploadedImages.filter(u => u !== url);
    document.getElementById('image_links').value = uploadedImages.join('\n');
    const status = document.getElementById('upload-status');
    status.innerHTML = uploadedImages.length > 0 ? `✅ ${uploadedImages.length} photo(s) ajoutée(s)` : '';
    previewItem.remove();
  });

  document.getElementById('preview-container').appendChild(previewItem);
}

