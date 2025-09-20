// Módulo de animaciones y efectos visuales
import { $$, observeElements, addClass, removeClass } from '../utils/helpers.js';

class AnimationManager {
  constructor() {
    this.animatedElements = [];
    this.typingElement = null;
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
    this.setupScrollAnimations();
    this.setupTypingAnimation();
    this.setupParallaxEffects();
    this.setupHoverEffects();
  }

  setupScrollAnimations() {
    // Elementos que se animan al entrar en viewport
    const elementsToAnimate = [
      ...$$('.material-card'),
      ...$$('.interest-item'),
      ...$$('.about-content'),
      ...$$('.section-header')
    ];

    // Observer para animaciones de scroll
    observeElements(elementsToAnimate, (element) => {
      this.animateElement(element);
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Animaciones específicas para diferentes tipos de elementos
    observeElements($$('.material-card'), (element, index) => {
      setTimeout(() => {
        addClass(element, 'animate-slide-up');
      }, index * 100); // Delay escalonado
    });

    observeElements($$('.interest-item'), (element, index) => {
      setTimeout(() => {
        addClass(element, 'animate-fade-in');
      }, index * 50);
    });
  }

  animateElement(element) {
    // Añadir clase base de animación
    addClass(element, 'animated');

    // Determinar tipo de animación basado en la posición del elemento
    const rect = element.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    if (rect.left < windowWidth / 2) {
      addClass(element, 'animate-slide-right');
    } else {
      addClass(element, 'animate-slide-left');
    }

    // Marcar como animado para evitar re-animación
    element.setAttribute('data-animated', 'true');
  }

  setupTypingAnimation() {
    this.typingElement = document.querySelector('.typing-text');
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
    const element = this.typingElement;
    element.textContent = '';

    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await this.wait(this.typingSpeed);
    }
  }

  async eraseText() {
    const element = this.typingElement;
    const text = element.textContent;

    for (let i = text.length; i > 0; i--) {
      element.textContent = text.substring(0, i - 1);
      await this.wait(this.erasingSpeed);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setupParallaxEffects() {
    // Efecto parallax sutil en el header
    const header = document.getElementById('header');
    if (header) {
      window.addEventListener('scroll', this.throttle(() => {
        const scrollY = window.pageYOffset;
        const rate = scrollY * -0.5;
        header.style.transform = `translate3d(0, ${rate}px, 0)`;
      }, 16));
    }

    // Parallax en elementos decorativos
    const parallaxElements = $$('[data-parallax]');
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      window.addEventListener('scroll', this.throttle(() => {
        const scrollY = window.pageYOffset;
        const rate = scrollY * -speed;
        element.style.transform = `translate3d(0, ${rate}px, 0)`;
      }, 16));
    });
  }

  setupHoverEffects() {
    // Efecto de seguimiento del cursor en cards
    const cards = $$('.material-card, .interest-item');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });

    // Efecto de ripple en botones
    const buttons = $$('.material-link, .social-link');
    buttons.forEach(button => {
      button.addEventListener('click', this.createRippleEffect);
    });
  }

  createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    // Añadir styles de ripple si no existen
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
        .material-link, .social-link {
          position: relative;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }

    button.appendChild(ripple);

    // Remover el ripple después de la animación
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Animaciones de loading
  showLoading(element) {
    addClass(element, 'loading');
  }

  hideLoading(element) {
    removeClass(element, 'loading');
  }

  // Animación de contadores
  animateCounter(element, start = 0, end, duration = 2000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = Math.round(current);
    }, 16);
  }

  // Animación de progreso
  animateProgress(element, percentage, duration = 1000) {
    element.style.width = '0%';
    element.style.transition = `width ${duration}ms ease-out`;

    setTimeout(() => {
      element.style.width = `${percentage}%`;
    }, 100);
  }

  // Shake animation para errores
  shakeElement(element) {
    addClass(element, 'shake');
    setTimeout(() => {
      removeClass(element, 'shake');
    }, 500);

    // Añadir CSS de shake si no existe
    if (!document.getElementById('shake-styles')) {
      const style = document.createElement('style');
      style.id = 'shake-styles';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Pulse animation
  pulseElement(element, duration = 1000) {
    addClass(element, 'pulse');
    setTimeout(() => {
      removeClass(element, 'pulse');
    }, duration);

    if (!document.getElementById('pulse-styles')) {
      const style = document.createElement('style');
      style.id = 'pulse-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse 1s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Función de throttle interna
  throttle(func, limit) {
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
  }

  // Método para pausar/reanudar animaciones
  pauseAnimations() {
    document.body.style.animationPlayState = 'paused';
  }

  resumeAnimations() {
    document.body.style.animationPlayState = 'running';
  }

  // Método para limpiar recursos
  destroy() {
    // Limpiar intervalos y timeouts si es necesario
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}

export default AnimationManager;