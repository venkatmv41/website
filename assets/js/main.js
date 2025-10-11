// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Animated counters for statistics
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200;

        counters.forEach(counter => {
            const updateCount = () => {
                const target = parseInt(counter.getAttribute('data-target') || counter.textContent.replace(/[^\d]/g, ''));
                const count = parseInt(counter.textContent.replace(/[^\d]/g, '')) || 0;
                const increment = target / speed;

                if (count < target) {
                    const newCount = Math.ceil(count + increment);
                    const originalText = counter.textContent;
                    const suffix = originalText.replace(/[\d,]/g, '');
                    counter.textContent = newCount.toLocaleString() + suffix;
                    setTimeout(updateCount, 1);
                } else {
                    const originalText = counter.getAttribute('data-original') || counter.textContent;
                    counter.textContent = originalText;
                }
            };

            // Store original text
            counter.setAttribute('data-original', counter.textContent);
            counter.setAttribute('data-target', counter.textContent.replace(/[^\d]/g, ''));
        });

        // Intersection Observer for counter animation
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.stat-number');
                    counters.forEach(counter => {
                        if (!counter.classList.contains('animated')) {
                            counter.classList.add('animated');
                            const updateCount = () => {
                                const target = parseInt(counter.getAttribute('data-target'));
                                const count = parseInt(counter.textContent.replace(/[^\d]/g, '')) || 0;
                                const increment = target / speed;

                                if (count < target) {
                                    const newCount = Math.ceil(count + increment);
                                    const originalText = counter.getAttribute('data-original');
                                    const suffix = originalText.replace(/[\d,]/g, '');
                                    counter.textContent = newCount.toLocaleString() + suffix;
                                    setTimeout(updateCount, 10);
                                } else {
                                    counter.textContent = counter.getAttribute('data-original');
                                }
                            };
                            counter.textContent = '0';
                            updateCount();
                        }
                    });
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.impact-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    // Initialize counter animation
    animateCounters();

    // Lazy loading for images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Initialize lazy loading
    lazyLoadImages();

    // Form validation and submission
    function initializeForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Basic form validation
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        showMessage('Please fill in all required fields', 'error');
                    } else {
                        field.classList.remove('error');
                    }
                });

                // Email validation
                const emailFields = form.querySelectorAll('input[type="email"]');
                emailFields.forEach(field => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (field.value && !emailRegex.test(field.value)) {
                        isValid = false;
                        field.classList.add('error');
                        showMessage('Please enter a valid email address', 'error');
                    }
                });

                if (isValid) {
                    // Simulate form submission
                    const submitBtn = form.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;

                    setTimeout(() => {
                        showMessage('Form submitted successfully!', 'success');
                        form.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                }
            });
        });
    }

    // Initialize forms
    initializeForms();

    // Show message function
    function showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `admin-message ${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.classList.add('show');
        }, 100);

        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }

    // Make showMessage globally available
    window.showMessage = showMessage;

    // Accessibility improvements
    function initializeAccessibility() {
        // Skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content ID if not exists
        const mainContent = document.querySelector('main') || document.querySelector('.hero');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }

        // Keyboard navigation for dropdowns
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-content');
            
            trigger.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
                
                if (e.key === 'Escape') {
                    menu.style.display = 'none';
                    trigger.focus();
                }
            });
        });

        // Focus management for modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.edit-modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
                
                const activePanel = document.querySelector('.admin-panel.active');
                if (activePanel) {
                    activePanel.classList.remove('active');
                }
            }
        });
    }

    // Initialize accessibility features
    initializeAccessibility();

    // Performance monitoring
    function initializePerformanceMonitoring() {
        // Monitor page load time
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            // Log to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_parameter: 'milliseconds'
                });
            }
        });

        // Monitor largest contentful paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log(`LCP: ${lastEntry.startTime}ms`);
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    // Initialize performance monitoring
    initializePerformanceMonitoring();

    // Search functionality (if search exists)
    function initializeSearch() {
        const searchInput = document.querySelector('#search-input');
        const searchResults = document.querySelector('#search-results');
        
        if (searchInput && searchResults) {
            let searchTimeout;
            
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.trim();
                
                if (query.length < 2) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                    return;
                }
                
                searchTimeout = setTimeout(() => {
                    performSearch(query);
                }, 300);
            });
        }
    }

    // Simple search function
    function performSearch(query) {
        // This would typically connect to a search API
        // For now, we'll simulate search results
        const searchResults = document.querySelector('#search-results');
        
        searchResults.innerHTML = `
            <div class="search-result">
                <h4>Search Results for "${query}"</h4>
                <p>Search functionality would be implemented here.</p>
            </div>
        `;
        searchResults.style.display = 'block';
    }

    // Initialize search
    initializeSearch();

    // Cookie consent (GDPR compliance)
    function initializeCookieConsent() {
        if (!localStorage.getItem('cookieConsent')) {
            const consentBanner = document.createElement('div');
            consentBanner.className = 'cookie-consent';
            consentBanner.innerHTML = `
                <div class="cookie-content">
                    <p>We use cookies to improve your experience on our website. By continuing to browse, you agree to our use of cookies.</p>
                    <div class="cookie-actions">
                        <button onclick="acceptCookies()" class="btn btn-primary">Accept</button>
                        <button onclick="declineCookies()" class="btn btn-outline">Decline</button>
                    </div>
                </div>
            `;
            document.body.appendChild(consentBanner);
        }
    }

    // Cookie consent functions
    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'accepted');
        document.querySelector('.cookie-consent').remove();
    };

    window.declineCookies = function() {
        localStorage.setItem('cookieConsent', 'declined');
        document.querySelector('.cookie-consent').remove();
    };

    // Initialize cookie consent
    initializeCookieConsent();

    console.log('NGO Website initialized successfully');
});