// Mobile Navigation
const menuToggle = document.getElementById('menuToggle');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawer = document.getElementById('closeDrawer');

function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawerFunc() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (menuToggle) menuToggle.addEventListener('click', openDrawer);
if (closeDrawer) closeDrawer.addEventListener('click', closeDrawerFunc);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawerFunc);

// Parallax Scrolling Effect
window.addEventListener('scroll', () => {
    const parallaxSections = document.querySelectorAll('.parallax-section');
    const scrolled = window.pageYOffset;
    
    parallaxSections.forEach(section => {
        const parallaxBg = section.querySelector('.parallax-bg');
        if (parallaxBg) {
            const rate = scrolled * 0.5;
            parallaxBg.style.transform = `translateY(${rate}px)`;
        }
    });
});

// Lazy Loading Images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Active Navigation Highlight
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.desktop-nav a, .drawer-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            closeDrawerFunc();
        }
    });
});

// Upcoming Event Data (will be fetched from backend eventually)
async function loadUpcomingEvent() {
    try {
        const response = await fetch('php/admin/get_events.php?limit=1&status=upcoming');
        const event = await response.json();
        if (event && event.title) {
            document.getElementById('nextEventTitle').textContent = event.title;
            document.getElementById('nextEventTime').textContent = event.time;
            document.getElementById('nextEventLocation').textContent = event.location;
            const eventDate = new Date(event.date);
            document.getElementById('nextEventDay').textContent = eventDate.getDate();
            document.getElementById('nextEventMonth').textContent = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        }
    } catch (error) {
        console.log('Using default event data');
    }
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const messageDiv = document.getElementById('formMessage');
        
        try {
            const response = await fetch('php/contact.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            messageDiv.innerHTML = `<div class="success">${result.message}</div>`;
            if (result.success) contactForm.reset();
        } catch (error) {
            messageDiv.innerHTML = '<div class="error">Error sending message. Please try again.</div>';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingEvent();
    
    // Add scroll animations
    const fadeElements = document.querySelectorAll('.quick-link-card, .testimonial-card, .value-item');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        fadeObserver.observe(el);
    });
});

/* ============================================
   ADDITIONAL JS FOR TOT ABOUT PAGE FEATURES
   - Flowing continuous stats marquee (smooth, slow)
   - No colors, no green, purely functional
   - Preserves existing mobile drawer functionality
   ============================================ */

(function() {
    'use strict';

    // ------------------------------------------------------------------
    // 1. Flowing Stats Bar - Continuous Slow Marquee
    // ------------------------------------------------------------------
    const statsTrack = document.getElementById('statsTrack');
    
    if (statsTrack) {
        let scrollPosition = 0;
        let animationFrameId = null;
        let isAnimating = true;
        let trackWidth = 0;
        let speed = 0.6; // pixels per frame - slow and smooth
        
        // Helper: get total width of one complete set of stat items
        function getOriginalSetWidth() {
            const items = statsTrack.children;
            if (!items.length) return 0;
            
            // We have duplicate content (original set + clone for seamless loop)
            const totalItems = items.length;
            const originalCount = totalItems / 2;
            
            if (originalCount === 0) return 0;
            
            let totalWidth = 0;
            for (let i = 0; i < originalCount; i++) {
                if (items[i]) {
                    totalWidth += items[i].offsetWidth;
                    // account for gap (gap is set via CSS gap property)
                }
            }
            // Add gaps between items (get computed gap from CSS)
            const containerStyles = window.getComputedStyle(statsTrack);
            const gapValue = parseFloat(containerStyles.gap) || 0;
            if (originalCount > 0 && gapValue > 0) {
                totalWidth += gapValue * (originalCount - 1);
            }
            
            return totalWidth;
        }
        
        // Update dimensions (especially after font load or resize)
        function updateTrackWidth() {
            trackWidth = getOriginalSetWidth();
            // Fallback: if still 0, use scrollWidth/2
            if (trackWidth <= 0 && statsTrack.scrollWidth > 0) {
                trackWidth = statsTrack.scrollWidth / 2;
            }
        }
        
        // Animation loop: moves the track continuously
        function animateMarquee() {
            if (!isAnimating) return;
            
            scrollPosition -= speed;
            
            // Reset position to create seamless infinite loop
            if (Math.abs(scrollPosition) >= trackWidth && trackWidth > 0) {
                scrollPosition = 0;
            }
            
            statsTrack.style.transform = `translateX(${scrollPosition}px)`;
            animationFrameId = requestAnimationFrame(animateMarquee);
        }
        
        // Start animation after dimensions are ready
        function startMarqueeAnimation() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            updateTrackWidth();
            
            if (trackWidth > 0 && isAnimating) {
                // Reset position
                scrollPosition = 0;
                statsTrack.style.transform = `translateX(0px)`;
                animateMarquee();
            } else if (trackWidth <= 0) {
                // Retry after short delay (fonts/images might not be ready)
                setTimeout(() => {
                    updateTrackWidth();
                    if (trackWidth > 0 && isAnimating) {
                        scrollPosition = 0;
                        animateMarquee();
                    }
                }, 300);
            }
        }
        
        // Handle resize events - recalculate width and keep animation smooth
        let resizeTimeout;
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasAnimating = isAnimating;
                // Pause temporarily to recalc
                isAnimating = false;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                
                updateTrackWidth();
                // Clamp scroll position to new width
                if (trackWidth > 0 && Math.abs(scrollPosition) >= trackWidth) {
                    scrollPosition = 0;
                }
                statsTrack.style.transform = `translateX(${scrollPosition}px)`;
                
                // Resume if needed
                if (wasAnimating && trackWidth > 0) {
                    isAnimating = true;
                    animateMarquee();
                } else if (wasAnimating) {
                    isAnimating = true;
                    // Retry after a brief moment
                    setTimeout(() => {
                        updateTrackWidth();
                        if (trackWidth > 0) {
                            animateMarquee();
                        }
                    }, 200);
                }
            }, 200);
        }
        
        // Pause on hover (user experience)
        const marqueeContainer = document.querySelector('.stats-track-container');
        if (marqueeContainer) {
            marqueeContainer.addEventListener('mouseenter', function() {
                isAnimating = false;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
            
            marqueeContainer.addEventListener('mouseleave', function() {
                if (!isAnimating) {
                    isAnimating = true;
                    // Ensure width is up to date
                    updateTrackWidth();
                    if (trackWidth > 0) {
                        animateMarquee();
                    } else {
                        // retry once
                        setTimeout(() => {
                            updateTrackWidth();
                            if (trackWidth > 0 && isAnimating) animateMarquee();
                        }, 150);
                    }
                }
            });
        }
        
        // Initialize when DOM is fully loaded and assets ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                startMarqueeAnimation();
                window.addEventListener('resize', handleResize);
                // Additional check after fonts (just in case)
                setTimeout(updateTrackWidth, 500);
            });
        } else {
            startMarqueeAnimation();
            window.addEventListener('resize', handleResize);
            setTimeout(updateTrackWidth, 500);
        }
        
    
        const images = document.querySelectorAll('.stat-item img');
        if (images.length) {
            let loadedCount = 0;
            const onImageLoad = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    updateTrackWidth();
                }
            };
            images.forEach(img => {
                if (img.complete) onImageLoad();
                else img.addEventListener('load', onImageLoad);
            });
        }
    }
    
    function initMobileDrawer() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const drawerOverlay = document.getElementById('drawerOverlay');
        const closeDrawerBtn = document.getElementById('closeDrawer');
        
        // Only initialize if elements exist 
        if (menuToggle && mobileDrawer && drawerOverlay && closeDrawerBtn) {

            if (!menuToggle.hasAttribute('data-drawer-initialized')) {
                menuToggle.setAttribute('data-drawer-initialized', 'true');
                
                function openDrawer() {
                    mobileDrawer.classList.add('open');
                    drawerOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                
                function closeDrawer() {
                    mobileDrawer.classList.remove('open');
                    drawerOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                menuToggle.addEventListener('click', openDrawer);
                closeDrawerBtn.addEventListener('click', closeDrawer);
                drawerOverlay.addEventListener('click', closeDrawer);
            }
        }
    }
    
    // Run mobile drawer 
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileDrawer);
    } else {
        initMobileDrawer();
    }
    

    const imgs = document.querySelectorAll('img[src="assets/images/totlogo.png"], img[src="assets/images/placeholder-leader.jpg"], img[src="assets/images/placeholder-leader2.jpg"]');
    imgs.forEach(img => {
        img.addEventListener('error', function() {
            if (!this.style.minWidth) {
                this.style.minWidth = '50px';
                this.style.minHeight = '50px';
                this.style.background = 'transparent';
                this.style.opacity = '0.5';
            }
        });
    });
    
})();

        // Mobile drawer functionality
        (function() {
            const menuToggle = document.getElementById('menuToggle');
            const mobileDrawer = document.getElementById('mobileDrawer');
            const drawerOverlay = document.getElementById('drawerOverlay');
            const closeDrawerBtn = document.getElementById('closeDrawer');
            
            if (menuToggle) {
                menuToggle.addEventListener('click', function() {
                    mobileDrawer.classList.add('open');
                    drawerOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            }
            function closeDrawer() {
                mobileDrawer.classList.remove('open');
                drawerOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
            if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
        })();