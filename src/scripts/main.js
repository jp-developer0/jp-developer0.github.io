// Script principal - Portfolio Juan Pablo González
import Navigation from './modules/navigation.js';
import AnimationManager from './modules/animations.js';
import { $, $$, on, storage, device } from './utils/helpers.js';

class PortfolioApp {
  constructor() {
    this.navigation = null;
    this.animationManager = null;
    this.isLoaded = false;

    this.init();
  }

  async init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    this.setupApp();
    this.loadPreferences();
    this.initializeModules();
    this.bindGlobalEvents();
    this.performanceOptimizations();

    this.isLoaded = true;
    console.log('🚀 Portfolio initialized successfully');
  }

  setupApp() {
    // Configurar variables globales del viewport
    this.updateViewportHeight();

    // Configurar tema y preferencias iniciales
    this.setupTheme();

    // Configurar lazy loading para imágenes
    this.setupLazyLoading();

    // Configurar analytics si está disponible
    this.setupAnalytics();
  }

  updateViewportHeight() {
    // Fix para height en móviles (viewport units)
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    on(window, 'resize', setVH);
    on(window, 'orientationchange', () => {
      setTimeout(setVH, 100);
    });
  }

  setupTheme() {
    // Manejar preferencias de color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = storage.get('theme');

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Escuchar cambios en las preferencias del sistema
    prefersDark.addListener((e) => {
      if (!storage.get('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  setupLazyLoading() {
    const images = $$('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback para navegadores sin soporte
      images.forEach(img => this.loadImage(img));
    }
  }

  loadImage(img) {
    // Cargar imagen con manejo de errores
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = img.dataset.src || img.src;
      img.classList.add('loaded');
    };
    tempImg.onerror = () => {
      img.classList.add('error');
      console.warn('Error loading image:', img.src);
    };
    tempImg.src = img.dataset.src || img.src;
  }

  setupAnalytics() {
    // Setup de Google Analytics si está disponible
    if (typeof gtag !== 'undefined') {
      // Track navegación
      this.trackNavigation();

      // Track interacciones
      this.trackInteractions();
    }
  }

  trackNavigation() {
    const navLinks = $$('.nav-link');
    navLinks.forEach(link => {
      on(link, 'click', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'navigation', {
            event_category: 'engagement',
            event_label: link.textContent.trim()
          });
        }
      });
    });
  }

  trackInteractions() {
    // Track clicks en materiales
    const materialLinks = $$('.material-link');
    materialLinks.forEach(link => {
      on(link, 'click', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'material_download', {
            event_category: 'engagement',
            event_label: link.closest('.material-card')?.querySelector('.material-title')?.textContent
          });
        }
      });
    });

    // Track clicks en redes sociales
    const socialLinks = $$('.social-link');
    socialLinks.forEach(link => {
      on(link, 'click', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'social_click', {
            event_category: 'engagement',
            event_label: link.getAttribute('aria-label')
          });
        }
      });
    });
  }

  loadPreferences() {
    // Cargar preferencias guardadas del usuario
    const preferences = storage.get('portfolio_preferences') || {};

    // Aplicar preferencias de animaciones
    if (preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
    }

    // Aplicar otras preferencias
    if (preferences.fontSize) {
      document.documentElement.style.fontSize = preferences.fontSize;
    }
  }

  initializeModules() {
    try {
      // Inicializar navegación
      this.navigation = new Navigation();

      // Inicializar animaciones
      this.animationManager = new AnimationManager();

      console.log('✅ Modules initialized');
    } catch (error) {
      console.error('❌ Error initializing modules:', error);
    }
  }

  bindGlobalEvents() {
    // Eventos globales de la aplicación

    // Manejo de errores globales
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error);
    });

    // Manejo de errores de recursos
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
    });

    // Eventos de visibilidad de página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onPageHidden();
      } else {
        this.onPageVisible();
      }
    });

    // Eventos de conexión
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());

    // Eventos de teclado globales
    on(document, 'keydown', (e) => this.handleGlobalKeydown(e));

    // Eventos de scroll para efectos adicionales
    let scrollTimeout;
    on(window, 'scroll', () => {
      document.body.classList.add('scrolling');

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 100);
    });

    // Eventos táctiles para dispositivos móviles
    if (device.hasTouch()) {
      this.setupTouchEvents();
    }
  }

  setupTouchEvents() {
    // Mejorar experiencia táctil
    let touchStartY = 0;

    on(document, 'touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    on(document, 'touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const touchDiff = touchStartY - touchY;

      // Agregar clase para efectos durante el scroll táctil
      if (Math.abs(touchDiff) > 10) {
        document.body.classList.add('touch-scrolling');
      }
    }, { passive: true });

    on(document, 'touchend', () => {
      setTimeout(() => {
        document.body.classList.remove('touch-scrolling');
      }, 300);
    });
  }

  handleGlobalKeydown(e) {
    // Atajos de teclado globales
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          this.openSearch();
          break;
        case '/':
          e.preventDefault();
          this.showKeyboardShortcuts();
          break;
      }
    }

    // Escape para cerrar overlays
    if (e.key === 'Escape') {
      this.closeOverlays();
    }
  }

  performanceOptimizations() {
    // Precargar recursos críticos
    this.preloadCriticalResources();

    // Configurar Service Worker si está disponible
    this.setupServiceWorker();

    // Optimizar fuentes
    this.optimizeFonts();

    // Configurar Resource Hints
    this.setupResourceHints();
  }

  preloadCriticalResources() {
    // Precargar imágenes críticas
    const criticalImages = [
      '/assets/img/me.jpg',
      '/favicon.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }
  }

  optimizeFonts() {
    // Optimizar carga de fuentes
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }
  }

  setupResourceHints() {
    // DNS prefetch para dominios externos
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'www.googletagmanager.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  // Métodos de manejo de eventos

  onPageHidden() {
    // Pausar animaciones cuando la página no es visible
    if (this.animationManager) {
      this.animationManager.pauseAnimations();
    }
  }

  onPageVisible() {
    // Reanudar animaciones cuando la página es visible
    if (this.animationManager) {
      this.animationManager.resumeAnimations();
    }
  }

  onOnline() {
    console.log('🌐 Connection restored');
    document.body.classList.remove('offline');
  }

  onOffline() {
    console.log('📵 Connection lost');
    document.body.classList.add('offline');
  }

  handleError(error) {
    // Manejo centralizado de errores
    console.error('Application error:', error);

    // Enviar error a analytics si está disponible
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message || 'Unknown error',
        fatal: false
      });
    }
  }

  // Métodos utilitarios

  openSearch() {
    // Implementar búsqueda si es necesario
    console.log('🔍 Search functionality not implemented yet');
  }

  showKeyboardShortcuts() {
    // Mostrar atajos de teclado
    console.log('⌨️ Keyboard shortcuts: Ctrl+K (Search), Esc (Close)');
  }

  closeOverlays() {
    // Cerrar overlays abiertos
    if (this.navigation && this.navigation.mainNav.classList.contains('active')) {
      this.navigation.closeMobileNav();
    }
  }

  // API pública

  getNavigation() {
    return this.navigation;
  }

  getAnimationManager() {
    return this.animationManager;
  }

  isAppLoaded() {
    return this.isLoaded;
  }

  // Método de limpieza
  destroy() {
    if (this.navigation) {
      this.navigation.destroy();
    }
    if (this.animationManager) {
      this.animationManager.destroy();
    }
  }
}

// Inicializar la aplicación
const app = new PortfolioApp();

// Exportar para uso global si es necesario
window.PortfolioApp = app;

// Configurar modo debug en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.DEBUG = true;
  window.app = app;
  console.log('🔧 Debug mode enabled. Access app instance via window.app');
}

export default app;