// ==============================================
// Controller Principal da Aplicação
// v9.4 - Arquitetura Moderna + Performance
// ==============================================

class App {
  constructor() {
    this.DOM = {
      nav: document.querySelector('.navbar'),
      menuBtn: document.querySelector('.mobile-menu-btn'),
      menu: document.querySelector('.nav-menu'),
      images: document.querySelectorAll('img[data-src]')
    };

    this.state = {
      menuOpen: false,
      scrollPos: 0
    };

    this.init();
}

  init() {
    this.setupEventListeners();
    this.initLazyLoading();
    this.initSmoothScroll();
    this.initAnalytics();
    this.setupAccessibility();
}

  setupEventListeners() {
    // Menu Mobile
    this.DOM.menuBtn.addEventListener('click', (e) => this.toggleMenu(e));
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    document.addEventListener('keydown', (e) => this.handleKeyEvents(e));

    // Scroll
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('resize', () => this.debouncedResize());

    // Desativa animações se preferido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
}

  toggleMenu(e) {
    e.stopPropagation();
    this.state.menuOpen = !this.state.menuOpen;
    this.DOM.menu.classList.toggle('active', this.state.menuOpen);
    this.DOM.menuBtn.setAttribute('aria-expanded', this.state.menuOpen);
    this.toggleBodyScroll(this.state.menuOpen);

    if (this.state.menuOpen) {
      this.trapFocus(this.DOM.menu);
    }
}

  handleOutsideClick(e) {
    if (!this.DOM.menu.contains(e.target) && !this.DOM.menuBtn.contains(e.target)) {
      this.closeMenu();
    }
}

  closeMenu() {
    this.state.menuOpen = false;
    this.DOM.menu.classList.remove('active');
    this.DOM.menuBtn.setAttribute('aria-expanded', 'false');
    this.toggleBodyScroll(false);
}

  handleKeyEvents(e) {
    // ESC para fechar menu
    if (e.key === 'Escape' && this.state.menuOpen) this.closeMenu();
    
    // Tab navigation no menu
    if (e.key === 'Tab' && this.state.menuOpen) {
      this.handleMenuTab(e);
    }
}

  handleMenuTab(e) {
    const focusable = [...this.DOM.menu.querySelectorAll('a, button')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
}

  toggleBodyScroll(disable) {
    document.body.style.overflow = disable ? 'hidden' : '';
    document.documentElement.style.scrollBehavior = disable ? 'unset' : 'smooth';
}

  initLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.01
    });

    this.DOM.images.forEach(img => observer.observe(img));
}

  loadImage(img) {
    const src = img.dataset.src;
    const loader = new Image();

    loader.src = src;
    loader.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    };
    
    loader.onerror = () => {
      img.classList.add('error');
      console.error(`Erro ao carregar: ${src}`);
    };
}

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;

        const headerHeight = this.DOM.nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
}

  handleScroll() {
    const currentScroll = window.scrollY;
    
    // Header sticky
    if (currentScroll > 100) {
      this.DOM.nav.classList.add('scrolled');
    } else {
      this.DOM.nav.classList.remove('scrolled');
    }

    // Back to top
    if (currentScroll > 500 && !this.state.backToTop) {
      this.createBackToTop();
    }

    this.state.scrollPos = currentScroll;
}

  createBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.ariaLabel = 'Voltar ao topo';
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    document.body.appendChild(btn);
    this.state.backToTop = true;
}

  initAnalytics() {
    // Track email clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', () => {
        if (window.ga) {
          ga('send', 'event', 'Contato', 'Email Click', link.href);
        }
      });
    });
}

  setupAccessibility() {
    // Roles ARIA
    this.DOM.menu.setAttribute('role', 'navigation');
    this.DOM.menuBtn.setAttribute('aria-controls', 'main-menu');
    this.DOM.menuBtn.setAttribute('aria-label', 'Menu principal');
    
    // Skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Ir para conteúdo principal';
    document.body.prepend(skipLink);
}

  debounce(fn, wait = 100) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
}

  get debouncedResize() {
    return this.debounce(() => {
      // Atualiza elementos após resize
      if (this.state.menuOpen) this.closeMenu();
    });
}

  trapFocus(element) {
    const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) {
      focusable[0].focus();
    }
}
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  
  // Hot Module Replacement
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
  }
});