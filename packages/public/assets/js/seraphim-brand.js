/**
 * Seraphim Vanguards Brand JavaScript
 * Version: 1.0.0
 * 
 * Provides interactive enhancements for the Seraphim Vanguards brand system
 */

(function() {
  'use strict';

  // ===================================
  // UTILITY FUNCTIONS
  // ===================================

  /**
   * Debounce function to limit rate of function execution
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Check if element is in viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // ===================================
  // GLOW EFFECTS
  // ===================================

  /**
   * Add dynamic glow effects to cards on hover
   */
  function initializeGlowEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        // Determine card type and apply appropriate glow
        if (this.classList.contains('card-security')) {
          this.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.5)';
        } else if (this.classList.contains('card-integrity')) {
          this.style.boxShadow = '0 0 40px rgba(220, 38, 38, 0.5)';
        } else if (this.classList.contains('card-accuracy')) {
          this.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.5)';
        } else {
          this.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.5)';
        }
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
      });
    });
  }

  // ===================================
  // TRINITY ANIMATION
  // ===================================

  /**
   * Animate trinity values with percentage counters
   */
  function animateTrinity() {
    const values = {
      security: 95,
      integrity: 87,
      accuracy: 99
    };
    
    Object.keys(values).forEach(key => {
      const element = document.querySelector(`.trinity-${key}`);
      if (!element) return;
      
      // Store original text
      const originalText = element.textContent;
      let current = 0;
      const target = values[key];
      
      const interval = setInterval(() => {
        if (current >= target) {
          clearInterval(interval);
          // Restore original text after animation
          setTimeout(() => {
            element.textContent = originalText;
          }, 2000);
        } else {
          current++;
          element.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} ${current}%`;
        }
      }, 20);
    });
  }

  // ===================================
  // SCROLL ANIMATIONS
  // ===================================

  /**
   * Add fade-in animations for elements as they enter viewport
   */
  function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .seraphim-grid > *');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }

  // ===================================
  // PARTICLE EFFECTS
  // ===================================

  /**
   * Create floating particle effects for hero sections
   */
  function createParticleEffect(container) {
    if (!container) return;
    
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--seraphim-gold);
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
      `;
      
      // Random starting position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      container.appendChild(particle);
      particles.push({
        element: particle,
        x: parseFloat(particle.style.left),
        y: parseFloat(particle.style.top),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0
      });
    }
    
    function animateParticles() {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.01;
        
        // Wrap around edges
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;
        
        // Update position and opacity
        p.element.style.left = p.x + '%';
        p.element.style.top = p.y + '%';
        p.element.style.opacity = Math.sin(p.life) * 0.5;
      });
      
      requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
  }

  // ===================================
  // SMOOTH SCROLL
  // ===================================

  /**
   * Initialize smooth scrolling for anchor links
   */
  function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ===================================
  // LOADING STATES
  // ===================================

  /**
   * Show/hide loading spinner
   */
  function showLoading(show = true) {
    let spinner = document.querySelector('.seraphim-spinner-overlay');
    
    if (show && !spinner) {
      spinner = document.createElement('div');
      spinner.className = 'seraphim-spinner-overlay';
      spinner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 10, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      spinner.innerHTML = '<div class="seraphim-spinner"></div>';
      document.body.appendChild(spinner);
    } else if (!show && spinner) {
      spinner.remove();
    }
  }

  // ===================================
  // THEME SWITCHER
  // ===================================

  /**
   * Initialize theme switching functionality
   */
  function initializeThemeSwitcher() {
    const themeSwitcher = document.querySelector('.theme-switcher');
    if (!themeSwitcher) return;
    
    const themes = {
      default: {
        '--seraphim-obsidian': '#0A0A0A',
        '--seraphim-ethereal': '#1A1A1A'
      },
      light: {
        '--seraphim-obsidian': '#F5F5F5',
        '--seraphim-ethereal': '#FFFFFF',
        '--seraphim-celestial': '#0A0A0A'
      }
    };
    
    themeSwitcher.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme || 'default';
      const newTheme = currentTheme === 'default' ? 'light' : 'default';
      
      Object.entries(themes[newTheme]).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
      
      document.body.dataset.theme = newTheme;
      localStorage.setItem('seraphim-theme', newTheme);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('seraphim-theme');
    if (savedTheme && themes[savedTheme]) {
      Object.entries(themes[savedTheme]).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
      document.body.dataset.theme = savedTheme;
    }
  }

  // ===================================
  // COPY TO CLIPBOARD
  // ===================================

  /**
   * Add copy to clipboard functionality for code blocks
   */
  function initializeCopyToClipboard() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: var(--seraphim-gold);
        color: var(--seraphim-obsidian);
        border: none;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        cursor: pointer;
        opacity: 0;
        transition: opacity var(--transition-fast);
      `;
      
      const pre = block.parentElement;
      pre.style.position = 'relative';
      pre.appendChild(button);
      
      pre.addEventListener('mouseenter', () => {
        button.style.opacity = '1';
      });
      
      pre.addEventListener('mouseleave', () => {
        button.style.opacity = '0';
      });
      
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(block.textContent);
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  }

  // ===================================
  // INITIALIZATION
  // ===================================

  /**
   * Initialize all brand features when DOM is ready
   */
  function initialize() {
    // Core features
    initializeGlowEffects();
    initializeSmoothScroll();
    initializeScrollAnimations();
    initializeThemeSwitcher();
    initializeCopyToClipboard();
    
    // Particle effects for hero sections
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      createParticleEffect(heroSection);
    }
    
    // Trinity animation on page load
    setTimeout(animateTrinity, 1000);
    
    // Re-run trinity animation on scroll
    let trinityAnimated = false;
    window.addEventListener('scroll', debounce(() => {
      const trinityDisplay = document.querySelector('.trinity-display');
      if (trinityDisplay && isInViewport(trinityDisplay) && !trinityAnimated) {
        animateTrinity();
        trinityAnimated = true;
      }
    }, 100));
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // ===================================
  // PUBLIC API
  // ===================================

  // Expose some functions globally for external use
  window.SeraphimBrand = {
    showLoading,
    animateTrinity,
    createParticleEffect
  };

})();