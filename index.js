// index.js - Mit Burger Menu Funktionalität
// Scroll Reveal + Stagger + Tilt + Burger Menu

(() => {
    // Beim Laden immer nach ganz oben scrollen
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // ---------------------------
    // BURGER MENU FUNKTIONALITÄT
    // ---------------------------
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (burger && navLinks) {
        // Toggle Menu
        burger.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            burger.classList.toggle('active');
            burger.setAttribute('aria-expanded', isActive);
            burger.setAttribute('aria-label', isActive ? 'Menü schließen' : 'Menü öffnen');
            
            // Body class für Overlay
            if (isActive) {
                body.classList.add('menu-open');
            } else {
                body.classList.remove('menu-open');
            }
        });

        // Schließe Menu bei Klick auf Link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                burger.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Menü öffnen');
                body.classList.remove('menu-open');
            });
        });

        // Schließe Menu bei Klick außerhalb (auf Overlay)
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !burger.contains(e.target)) {
                navLinks.classList.remove('active');
                burger.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Menü öffnen');
                body.classList.remove('menu-open');
            }
        });

        // Schließe Menu bei ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
                burger.setAttribute('aria-label', 'Menü öffnen');
                body.classList.remove('menu-open');
            }
        });
    }

    // ---------------------------
    // AUTO REVEAL MARKS
    // ---------------------------
    const autoRevealSelectors = [".section-head", ".card", ".project", ".contact-card"];
    autoRevealSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
            if (!el.classList.contains("about-image")) {
                el.classList.add("reveal");
            }
        });
    });

    if (prefersReduced) {
        document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
        return;
    }

    // ---------------------------
    // STAGGER
    // ---------------------------
    const applyStagger = (containerSelector) => {
        document.querySelectorAll(containerSelector).forEach((container) => {
            const kids = [...container.querySelectorAll(".reveal")];
            kids.forEach((el, i) => (el.style.transitionDelay = `${Math.min(i * 90, 450)}ms`));
        });
    };

    applyStagger(".projects-grid");
    applyStagger(".skills-grid");
    applyStagger(".cards");

    // ---------------------------
    // REVEAL OBSERVER
    // ---------------------------
    const elements = [...document.querySelectorAll(".reveal")];
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                } else {
                    entry.target.classList.remove("is-visible");
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    elements.forEach((el) => io.observe(el));

    // ---------------------------
    // SANFTER TILT
    // ---------------------------
    if (!canHover) return;

    function createTilt(card, { maxTilt = 3, lift = -4 } = {}) {
        let rect = null;
        let rafId = null;
        let isHovering = false;

        let mouseX = 0;
        let mouseY = 0;
        let curRotX = 0;
        let curRotY = 0;

        const lerp = (a, b, t) => a + (b - a) * t;

        const updateRect = () => {
            rect = card.getBoundingClientRect();
        };

        const frame = () => {
            if (!isHovering) {
                curRotX = lerp(curRotX, 0, 0.1);
                curRotY = lerp(curRotY, 0, 0.1);

                if (Math.abs(curRotX) < 0.01 && Math.abs(curRotY) < 0.01) {
                    curRotX = curRotY = 0;
                    card.style.transform = "translate3d(0, 0, 0)";
                    card.style.willChange = "";
                    rafId = null;
                    return;
                }

                card.style.transform =
                    `translate3d(0, 0, 0) perspective(1000px) rotateX(${curRotX}deg) rotateY(${curRotY}deg)`;
                rafId = requestAnimationFrame(frame);
                return;
            }

            if (!rect) updateRect();

            const x = mouseX - rect.left;
            const y = mouseY - rect.top;

            const px = (x / rect.width) - 0.5;
            const py = (y / rect.height) - 0.5;

            const targetRotY = px * maxTilt;
            const targetRotX = -py * maxTilt;

            curRotX = lerp(curRotX, targetRotX, 0.06);
            curRotY = lerp(curRotY, targetRotY, 0.06);

            card.style.transform =
                `translate3d(0, ${lift}px, 0) perspective(1000px) rotateX(${curRotX}deg) rotateY(${curRotY}deg)`;

            rafId = requestAnimationFrame(frame);
        };

        const onEnter = () => {
            isHovering = true;
            updateRect();
            card.style.willChange = "transform";
            card.style.transition = "none";
            if (!rafId) rafId = requestAnimationFrame(frame);
        };

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const onLeave = () => {
            isHovering = false;
            if (!rafId) rafId = requestAnimationFrame(frame);
        };

        const invalidate = () => {
            rect = null;
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);

        window.addEventListener("resize", invalidate);
        window.addEventListener("scroll", invalidate, { passive: true });

        return () => {
            card.removeEventListener("mouseenter", onEnter);
            card.removeEventListener("mousemove", onMove);
            card.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("resize", invalidate);
            window.removeEventListener("scroll", invalidate);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }

    // Tilt für Projekt-Cards
    document.querySelectorAll(".project.card").forEach((card) => {
        createTilt(card, { maxTilt: 3, lift: -4 });
    });
})();
