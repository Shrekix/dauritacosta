// ==============================================
// Carregamento Inteligente de Vídeos
// v8.2 - Lazy Loading + Otimização de Performance
// ==============================================

/**
 * Inicializa o carregamento otimizado de vídeos
 * @param {Object} config - Configurações personalizadas
 * @param {string} config.selector - Seletor dos containers de vídeo
 * @param {boolean} config.autoplay - Se deve autoplay ao entrar na viewport
 * @param {number} config.threshold - Porcentagem visível para carregar
 */
export function initVideoLoader({
  selector = '.video-container',
  autoplay = true,
  threshold = 0.25
} = {}) {
  const videoContainers = document.querySelectorAll(selector);

  if (!videoContainers.length) return;

  // Configuração do Intersection Observer
  const observerConfig = {
    rootMargin: '50px',
    threshold
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        const video = container.querySelector('video');
        const placeholder = container.querySelector('.video-placeholder');
        const source = video?.querySelector('source[data-src]');

        if (!source) return;

        // Carregamento progressivo
        loadVideoSource({
          video,
          source,
          placeholder,
          autoplay
        });

        observer.unobserve(container);
      }
    });
  }, observerConfig);

  // Inicializa observação
  videoContainers.forEach(container => {
    addVideoPlaceholder(container);
    observer.observe(container);
  });
}

/**
 * Carrega a fonte do vídeo de forma otimizada
 */
async function loadVideoSource({ video, source, placeholder, autoplay }) {
  try {
    // Exibe loader durante o carregamento
    const loader = createVideoLoader();
    placeholder.replaceWith(loader);

    // Carrega a fonte real
    source.src = source.dataset.src;
    video.load();

    // Espera por metadados para controle preciso
    await new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', resolve);
      video.addEventListener('error', reject);
    });

    // Transição suave
    fadeOutElement(loader, () => {
      video.classList.add('video-loaded');
      if (autoplay) video.play();
    });

    // Evento customizado para tracking
    document.dispatchEvent(new CustomEvent('videoLoaded', {
      detail: { video }
    }));
  } catch (error) {
    handleVideoError(loader, error);
  }
}

/**
 * Cria placeholder visual para LCP
 */
function addVideoPlaceholder(container) {
  const placeholder = document.createElement('div');
  placeholder.className = 'video-placeholder';
  placeholder.innerHTML = `
    <div class="placeholder-content">
      <div class="loader"></div>
    </div>
  `;
  container.appendChild(placeholder);
}

/**
 * Componente de loading customizado
 */
function createVideoLoader() {
  const loader = document.createElement('div');
  loader.className = 'video-loader';
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <p class="loading-text">Carregando conteúdo...</p>
  `;
  return loader;
}

/**
 * Tratamento de erros robusto
 */
function handleVideoError(loader, error) {
  console.error('Erro no carregamento do vídeo:', error);
  loader.innerHTML = `
    <div class="video-error">
      <p>Conteúdo não disponível</p>
      <button class="retry-btn">Tentar novamente</button>
    </div>
  `;
  loader.querySelector('.retry-btn').onclick = () => location.reload();
}

/**
 * Animação de transição suave
 */
function fadeOutElement(element, callback) {
  element.style.transition = 'opacity 0.4s ease';
  element.style.opacity = '0';
  setTimeout(() => {
    element.remove();
    callback?.();
  }, 400);
}

// Inicialização automática se módulo principal
if (import.meta.env?.MODE !== 'library') {
  document.addEventListener('DOMContentLoaded', () => {
    initVideoLoader();
    
    // Hot Module Replacement para dev
    if (import.meta.hot) {
      import.meta.hot.accept((newModule) => {
        newModule.initVideoLoader();
      });
    }
  });
}