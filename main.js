// Script principal compatible con navegadores - Portfolio Juan Pablo González
// Version sin módulos ES6 para compatibilidad directa

(function() {
  'use strict';

  // Utilidades básicas
  const $ = (selector, context = document) => {
    return typeof selector === 'string' ? context.querySelector(selector) : selector;
  };

  const $$ = (selector, context = document) => {
    return typeof selector === 'string' ? Array.from(context.querySelectorAll(selector)) : [selector];
  };

  const on = (element, event, handler, options = {}) => {
    const elements = Array.isArray(element) ? element : [element];
    elements.forEach(el => {
      if (el && typeof el.addEventListener === 'function') {
        el.addEventListener(event, handler, options);
      }
    });
  };

  const addClass = (element, className) => {
    if (element && element.classList) {
      element.classList.add(className);
    }
  };

  const removeClass = (element, className) => {
    if (element && element.classList) {
      element.classList.remove(className);
    }
  };

  const toggleClass = (element, className) => {
    if (element && element.classList) {
      element.classList.toggle(className);
    }
  };

  const hasClass = (element, className) => {
    return element && element.classList && element.classList.contains(className);
  };

  // Throttle function
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Smooth scroll
  const scrollToElement = (target, offset = 0) => {
    const element = typeof target === 'string' ? $(target) : target;
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  // Clase principal de la aplicación
  class PortfolioApp {
    constructor() {
      this.header = $('#header');
      this.mobileToggle = $('.mobile-nav-toggle');
      this.mainNav = $('.main-nav');
      this.navLinks = $$('.nav-link');
      this.sections = $$('section[id]');
      this.typingElement = $('.typing-text');
      
      this.isScrolled = false;
      this.activeSection = '';
      this.scrollThreshold = 100;
      
      this.typingTexts = [
        'Desarrollador Full-Stack',
        'Ingeniero de Software',
        'Especialista en Machine Learning',
        'Arquitecto de Soluciones',
        'Data Scientist'
      ];
      this.currentTextIndex = 0;
      this.typingSpeed = 100;
      this.erasingSpeed = 50;
      this.delayBetweenTexts = 2000;

      this.init();
    }

    init() {
      this.setupApp();
      this.bindEvents();
      this.setupTypingAnimation();
      this.setupAnimations();
      this.updateActiveSection();
      
      console.log('🚀 Portfolio initialized successfully');
    }

    setupApp() {
      // Fix para height en móviles
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      on(window, 'resize', setVH);
      on(window, 'orientationchange', () => setTimeout(setVH, 100));

      // Setup lazy loading
      this.setupLazyLoading();
    }

    bindEvents() {
      // Scroll events
      on(window, 'scroll', throttle(() => {
        this.handleScroll();
        this.updateActiveSection();
      }, 16));

      // Navigation clicks
      this.navLinks.forEach(link => {
        on(link, 'click', (e) => this.handleNavClick(e));
      });

      // Mobile toggle
      if (this.mobileToggle) {
        on(this.mobileToggle, 'click', () => this.toggleMobileNav());
      }

      // Close mobile menu on outside click
      on(document, 'click', (e) => this.handleOutsideClick(e));

      // Keyboard navigation
      on(document, 'keydown', (e) => this.handleKeydown(e));

      // Resize events
      on(window, 'resize', throttle(() => this.handleResize(), 250));
    }

    handleScroll() {
      const scrollY = window.pageYOffset;

      // Toggle header fixed state
      if (scrollY > this.scrollThreshold && !this.isScrolled) {
        this.isScrolled = true;
        addClass(this.header, 'header-scrolled');
      } else if (scrollY <= this.scrollThreshold && this.isScrolled) {
        this.isScrolled = false;
        removeClass(this.header, 'header-scrolled');
      }
    }

    updateActiveSection() {
      let currentSection = '';
      const scrollY = window.pageYOffset;
      const headerHeight = this.isScrolled ? 80 : 0;

      this.sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top + scrollY;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop - headerHeight - 100 &&
            scrollY < sectionTop + sectionHeight - headerHeight - 100) {
          currentSection = `#${section.id}`;
        }
      });

      if (scrollY < 200) {
        currentSection = '#header';
      }

      if (currentSection && currentSection !== this.activeSection) {
        this.activeSection = currentSection;
        this.setActiveLink(currentSection);
        this.updateURL(currentSection);
      }
    }

    setActiveLink(target) {
      this.navLinks.forEach(link => {
        removeClass(link, 'active');
        link.removeAttribute('aria-current');
      });

      const activeLink = $(`.nav-link[href="${target}"]`);
      if (activeLink) {
        addClass(activeLink, 'active');
        activeLink.setAttribute('aria-current', 'page');
      }
    }

    updateURL(target) {
      if (history.pushState && target !== window.location.hash) {
        const url = target === '#header' ?
          window.location.pathname :
          `${window.location.pathname}${target}`;
        history.replaceState(null, null, url);
      }
    }

    handleNavClick(e) {
      e.preventDefault();
      const link = e.currentTarget;
      const target = link.getAttribute('href');

      if (target && $(target)) {
        this.scrollToSection(target);
        this.setActiveLink(target);

        if (hasClass(this.mainNav, 'active')) {
          this.closeMobileNav();
        }

        setTimeout(() => {
          const targetElement = $(target);
          if (targetElement) {
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
            targetElement.removeAttribute('tabindex');
          }
        }, 300);
      }
    }

    scrollToSection(target, smooth = true) {
      const element = $(target);
      if (!element) return;

      const headerHeight = this.isScrolled ? 80 : 0;
      const offset = target === '#header' ? 0 : headerHeight + 20;

      if (smooth) {
        scrollToElement(element, offset);
      } else {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo(0, offsetPosition);
      }
    }

    toggleMobileNav() {
      toggleClass(this.mainNav, 'active');
      toggleClass(this.mobileToggle, 'active');

      const isOpen = hasClass(this.mainNav, 'active');
      this.mobileToggle.setAttribute('aria-expanded', isOpen);

      if (isOpen) {
        addClass(document.body, 'nav-open');
      } else {
        removeClass(document.body, 'nav-open');
      }
    }

    closeMobileNav() {
      removeClass(this.mainNav, 'active');
      removeClass(this.mobileToggle, 'active');
      removeClass(document.body, 'nav-open');
      this.mobileToggle.setAttribute('aria-expanded', 'false');
    }

    handleOutsideClick(e) {
      if (hasClass(this.mainNav, 'active') &&
          !this.mainNav.contains(e.target) &&
          !this.mobileToggle.contains(e.target)) {
        this.closeMobileNav();
      }
    }

    handleKeydown(e) {
      if (e.key === 'Escape' && hasClass(this.mainNav, 'active')) {
        this.closeMobileNav();
        this.mobileToggle.focus();
      }
    }

    handleResize() {
      if (window.innerWidth > 992 && hasClass(this.mainNav, 'active')) {
        this.closeMobileNav();
      }
    }

    // Typing animation
    setupTypingAnimation() {
      if (this.typingElement) {
        this.startTypingAnimation();
      }
    }

    async startTypingAnimation() {
      while (true) {
        await this.typeText(this.typingTexts[this.currentTextIndex]);
        await this.wait(this.delayBetweenTexts);
        await this.eraseText();
        await this.wait(500);
        this.currentTextIndex = (this.currentTextIndex + 1) % this.typingTexts.length;
      }
    }

    async typeText(text) {
      this.typingElement.textContent = '';
      for (let i = 0; i < text.length; i++) {
        this.typingElement.textContent += text[i];
        await this.wait(this.typingSpeed);
      }
    }

    async eraseText() {
      const text = this.typingElement.textContent;
      for (let i = text.length; i > 0; i--) {
        this.typingElement.textContent = text.substring(0, i - 1);
        await this.wait(this.erasingSpeed);
      }
    }

    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Lazy loading setup
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
        images.forEach(img => this.loadImage(img));
      }
    }

    loadImage(img) {
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = img.dataset.src || img.src;
        addClass(img, 'loaded');
      };
      tempImg.onerror = () => {
        addClass(img, 'error');
        console.warn('Error loading image:', img.src);
      };
      tempImg.src = img.dataset.src || img.src;
    }

    // Setup animations
    setupAnimations() {
      this.setupScrollAnimations();
      this.setupHoverEffects();
    }

    setupScrollAnimations() {
      const elementsToAnimate = [
        ...$$('.material-card'),
        ...$$('.interest-item'),
        ...$$('.about-content'),
        ...$$('.section-header')
      ];

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });

        elementsToAnimate.forEach(el => observer.observe(el));
      }
    }

    animateElement(element) {
      addClass(element, 'animate-fade-in');
      element.setAttribute('data-animated', 'true');
    }

    setupHoverEffects() {
      const cards = $$('.material-card, .interest-item');

      cards.forEach(card => {
        on(card, 'mouseenter', () => {
          addClass(card, 'hover-lift');
        });

        on(card, 'mouseleave', () => {
          removeClass(card, 'hover-lift');
        });
      });
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.portfolioApp = new PortfolioApp();
    });
  } else {
    window.portfolioApp = new PortfolioApp();
  }

  // ===== PAGINACIÓN DE MATERIAL EDUCATIVO =====
  class MaterialPagination {
    constructor() {
      this.currentPage = 1;
      this.itemsPerPage = 6;
      this.totalPages = 0;
      this.materialCards = $$('.material-card[data-page]');
      this.paginationNumbers = $('#paginationNumbers');
      this.prevBtn = $('.pagination-prev');
      this.nextBtn = $('.pagination-next');
      this.currentPageInfo = $('#currentPageInfo');
      this.totalPagesInfo = $('#totalPagesInfo');

      if (this.materialCards.length > 0) {
        this.init();
      }
    }

    init() {
      this.calculateTotalPages();
      this.renderPaginationNumbers();
      this.bindEvents();
      this.showPage(1);
      console.log('📄 Paginación inicializada:', this.totalPages, 'páginas');
    }

    calculateTotalPages() {
      // Obtener el número de página más alto
      let maxPage = 0;
      this.materialCards.forEach(card => {
        const page = parseInt(card.getAttribute('data-page'));
        if (page > maxPage) maxPage = page;
      });
      this.totalPages = maxPage;

      if (this.totalPagesInfo) {
        this.totalPagesInfo.textContent = this.totalPages;
      }
    }

    bindEvents() {
      if (this.prevBtn) {
        on(this.prevBtn, 'click', () => this.goToPrevPage());
      }

      if (this.nextBtn) {
        on(this.nextBtn, 'click', () => this.goToNextPage());
      }
    }

    renderPaginationNumbers() {
      if (!this.paginationNumbers) return;

      this.paginationNumbers.innerHTML = '';

      for (let i = 1; i <= this.totalPages; i++) {
        const button = document.createElement('button');
        button.className = 'pagination-number';
        button.textContent = i;
        button.setAttribute('aria-label', `Ir a página ${i}`);

        if (i === this.currentPage) {
          button.classList.add('active');
          button.setAttribute('aria-current', 'page');
        }

        on(button, 'click', () => this.goToPage(i));
        this.paginationNumbers.appendChild(button);
      }
    }

    showPage(pageNumber) {
      if (pageNumber < 1 || pageNumber > this.totalPages) return;

      this.currentPage = pageNumber;

      // Ocultar todas las tarjetas y mostrar solo las de la página actual
      this.materialCards.forEach(card => {
        const cardPage = parseInt(card.getAttribute('data-page'));
        if (cardPage === pageNumber) {
          addClass(card, 'page-visible');
          // Trigger animation
          setTimeout(() => {
            addClass(card, 'animate-fade-in');
          }, 50);
        } else {
          removeClass(card, 'page-visible');
          removeClass(card, 'animate-fade-in');
        }
      });

      // Actualizar botones
      this.updateButtons();

      // Actualizar números de paginación
      this.updatePaginationNumbers();

      // Actualizar info de página
      if (this.currentPageInfo) {
        this.currentPageInfo.textContent = pageNumber;
      }
    }

    updateButtons() {
      if (this.prevBtn) {
        if (this.currentPage === 1) {
          this.prevBtn.disabled = true;
          this.prevBtn.setAttribute('aria-disabled', 'true');
        } else {
          this.prevBtn.disabled = false;
          this.prevBtn.setAttribute('aria-disabled', 'false');
        }
      }

      if (this.nextBtn) {
        if (this.currentPage === this.totalPages) {
          this.nextBtn.disabled = true;
          this.nextBtn.setAttribute('aria-disabled', 'true');
        } else {
          this.nextBtn.disabled = false;
          this.nextBtn.setAttribute('aria-disabled', 'false');
        }
      }
    }

    updatePaginationNumbers() {
      const numbers = $$('.pagination-number');
      numbers.forEach((button, index) => {
        const page = index + 1;
        if (page === this.currentPage) {
          addClass(button, 'active');
          button.setAttribute('aria-current', 'page');
        } else {
          removeClass(button, 'active');
          button.removeAttribute('aria-current');
        }
      });
    }

    goToPage(pageNumber) {
      if (pageNumber !== this.currentPage) {
        this.showPage(pageNumber);
      }
    }

    goToPrevPage() {
      if (this.currentPage > 1) {
        this.showPage(this.currentPage - 1);
      }
    }

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.showPage(this.currentPage + 1);
      }
    }
  }

  // Inicializar paginación cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.materialPagination = new MaterialPagination();
    });
  } else {
    window.materialPagination = new MaterialPagination();
  }

  // Setup Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => console.log('✅ Service Worker registered'))
        .catch(error => console.log('❌ Service Worker registration failed:', error));
    });
  }

})();
