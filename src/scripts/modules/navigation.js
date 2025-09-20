// Módulo de navegación moderna
import { $, $$, on, addClass, removeClass, toggleClass, hasClass, scrollToElement, throttle, debounce } from '../utils/helpers.js';

class Navigation {
  constructor() {
    this.header = $('#header');
    this.mobileToggle = $('.mobile-nav-toggle');
    this.mainNav = $('.main-nav');
    this.navLinks = $$('.nav-link');
    this.sections = $$('section[id]');

    this.isScrolled = false;
    this.activeSection = '';
    this.scrollThreshold = 100;

    this.init();
  }

  init() {
    this.bindEvents();
    this.handleInitialLoad();
    this.updateActiveSection();
  }

  bindEvents() {
    // Scroll events con throttling para mejor performance
    on(window, 'scroll', throttle(() => {
      this.handleScroll();
      this.updateActiveSection();
    }, 16)); // ~60fps

    // Navegación por clics
    this.navLinks.forEach(link => {
      on(link, 'click', (e) => this.handleNavClick(e));
    });

    // Toggle móvil
    if (this.mobileToggle) {
      on(this.mobileToggle, 'click', () => this.toggleMobileNav());
    }

    // Cerrar menú móvil al hacer clic fuera
    on(document, 'click', (e) => this.handleOutsideClick(e));

    // Keyboard navigation
    on(document, 'keydown', (e) => this.handleKeydown(e));

    // Resize events
    on(window, 'resize', debounce(() => {
      this.handleResize();
    }, 250));
  }

  handleInitialLoad() {
    // Manejo del hash inicial en la URL
    const hash = window.location.hash;
    if (hash && $(hash)) {
      setTimeout(() => {
        this.scrollToSection(hash, false);
        this.setActiveLink(hash);
      }, 100);
    }
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

    // Encontrar la sección activa basada en el scroll
    this.sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + scrollY;
      const sectionHeight = section.offsetHeight;

      if (scrollY >= sectionTop - headerHeight - 100 &&
          scrollY < sectionTop + sectionHeight - headerHeight - 100) {
        currentSection = `#${section.id}`;
      }
    });

    // Si estamos en el top, activar el home
    if (scrollY < 200) {
      currentSection = '#header';
    }

    // Actualizar solo si la sección cambió
    if (currentSection && currentSection !== this.activeSection) {
      this.activeSection = currentSection;
      this.setActiveLink(currentSection);
      this.updateURL(currentSection);
    }
  }

  setActiveLink(target) {
    // Remover clase activa de todos los links
    this.navLinks.forEach(link => {
      removeClass(link, 'active');
      link.removeAttribute('aria-current');
    });

    // Añadir clase activa al link correspondiente
    const activeLink = $(`.nav-link[href="${target}"]`);
    if (activeLink) {
      addClass(activeLink, 'active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  updateURL(target) {
    // Actualizar URL sin recargar la página
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

      // Cerrar menú móvil si está abierto
      if (hasClass(this.mainNav, 'active')) {
        this.closeMobileNav();
      }

      // Focus management para accesibilidad
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
      // Scroll inmediato
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo(0, offsetPosition);
    }
  }

  toggleMobileNav() {
    toggleClass(this.mainNav, 'active');
    toggleClass(this.mobileToggle, 'active');

    const isOpen = hasClass(this.mainNav, 'active');

    // Update ARIA attributes
    this.mobileToggle.setAttribute('aria-expanded', isOpen);

    // Prevent body scroll when menu is open
    if (isOpen) {
      addClass(document.body, 'nav-open');
    } else {
      removeClass(document.body, 'nav-open');
    }

    // Focus management
    if (isOpen) {
      // Focus first nav item
      const firstNavLink = $('.nav-link');
      if (firstNavLink) {
        setTimeout(() => firstNavLink.focus(), 100);
      }
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
    // Cerrar menú móvil con Escape
    if (e.key === 'Escape' && hasClass(this.mainNav, 'active')) {
      this.closeMobileNav();
      this.mobileToggle.focus();
    }

    // Navegación con teclado en el menú móvil
    if (hasClass(this.mainNav, 'active')) {
      const focusableElements = this.navLinks.filter(link =>
        link.offsetParent !== null
      );

      const currentIndex = focusableElements.indexOf(document.activeElement);

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ?
          focusableElements.length - 1 :
          currentIndex - 1;
        focusableElements[prevIndex].focus();
      }
    }
  }

  handleResize() {
    // Cerrar menú móvil en desktop
    if (window.innerWidth > 992 && hasClass(this.mainNav, 'active')) {
      this.closeMobileNav();
    }
  }

  // Método público para navegar programáticamente
  navigateTo(target) {
    if ($(target)) {
      this.scrollToSection(target);
      this.setActiveLink(target);
    }
  }

  // Método para obtener la sección activa
  getActiveSection() {
    return this.activeSection;
  }

  // Método para destruir el componente
  destroy() {
    // Remover event listeners si es necesario
    // (En este caso, los event listeners se limpiarán automáticamente
    // cuando el componente sea garbage collected)
  }
}

export default Navigation;