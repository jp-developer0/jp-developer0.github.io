// Utilidades y helpers modernos

/**
 * Selector mejorado que reemplaza jQuery
 */
export const $ = (selector, context = document) => {
  if (typeof selector === 'string') {
    return context.querySelector(selector);
  }
  return selector;
};

export const $$ = (selector, context = document) => {
  if (typeof selector === 'string') {
    return Array.from(context.querySelectorAll(selector));
  }
  return [selector];
};

/**
 * Manejo de eventos moderno
 */
export const on = (element, event, handler, options = {}) => {
  const elements = Array.isArray(element) ? element : [element];
  elements.forEach(el => {
    if (el && typeof el.addEventListener === 'function') {
      el.addEventListener(event, handler, options);
    }
  });
};

export const off = (element, event, handler, options = {}) => {
  const elements = Array.isArray(element) ? element : [element];
  elements.forEach(el => {
    if (el && typeof el.removeEventListener === 'function') {
      el.removeEventListener(event, handler, options);
    }
  });
};

/**
 * Utilidades de animación
 */
export const animate = (element, keyframes, options = {}) => {
  if (!element || typeof element.animate !== 'function') {
    return Promise.resolve();
  }

  const animation = element.animate(keyframes, {
    duration: 300,
    easing: 'ease-out',
    fill: 'both',
    ...options
  });

  return animation.finished;
};

/**
 * Fade in/out animations
 */
export const fadeIn = (element, duration = 300) => {
  return animate(element, [
    { opacity: 0 },
    { opacity: 1 }
  ], { duration });
};

export const fadeOut = (element, duration = 300) => {
  return animate(element, [
    { opacity: 1 },
    { opacity: 0 }
  ], { duration });
};

export const slideUp = (element, duration = 300) => {
  return animate(element, [
    { transform: 'translateY(20px)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration });
};

export const slideDown = (element, duration = 300) => {
  return animate(element, [
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(20px)', opacity: 0 }
  ], { duration });
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Intersection Observer helper para animaciones en scroll
 */
export const observeElements = (elements, callback, options = {}) => {
  if (!window.IntersectionObserver) {
    // Fallback para navegadores que no soportan IntersectionObserver
    elements.forEach(callback);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  });

  elements.forEach(el => observer.observe(el));
  return observer;
};

/**
 * Smooth scroll to element
 */
export const scrollToElement = (target, offset = 0) => {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

/**
 * Get scroll position
 */
export const getScrollPosition = () => {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Get element offset
 */
export const getElementOffset = (element) => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
    width: rect.width,
    height: rect.height
  };
};

/**
 * CSS class utilities
 */
export const addClass = (element, className) => {
  if (element && element.classList) {
    element.classList.add(className);
  }
};

export const removeClass = (element, className) => {
  if (element && element.classList) {
    element.classList.remove(className);
  }
};

export const toggleClass = (element, className) => {
  if (element && element.classList) {
    element.classList.toggle(className);
  }
};

export const hasClass = (element, className) => {
  return element && element.classList && element.classList.contains(className);
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
      return false;
    }
  }
};

/**
 * Device detection
 */
export const device = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  hasTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

/**
 * Performance helpers
 */
export const requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  ((callback) => setTimeout(callback, 1000 / 60));

export const cancelAnimationFrame = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.oCancelAnimationFrame ||
  window.msCancelAnimationFrame ||
  clearTimeout;

/**
 * URL utilities
 */
export const url = {
  getParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  setParam: (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  },

  removeParam: (key) => {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  }
};

/**
 * Validation utilities
 */
export const validate = {
  email: (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  },

  phone: (phone) => {
    const pattern = /^\+?[\d\s\-\(\)]{10,}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Format utilities
 */
export const format = {
  currency: (amount, currency = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  date: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('es-AR', { ...defaultOptions, ...options }).format(new Date(date));
  },

  number: (number) => {
    return new Intl.NumberFormat('es-AR').format(number);
  }
};