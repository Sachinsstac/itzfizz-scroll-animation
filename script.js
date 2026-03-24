/* ===========================================================
   LIGHTWEIGHT GSAP BUILD

   Total animations: 3
     1. Hero entrance timeline (letters + content)
     2. Stat counters
     3. One scroll-driven exit + section reveals

   Total ScrollTrigger instances: 4
   Total active tweens during scroll: 1 timeline
   Canvas: NONE
   Custom cursor: NONE
   Parallax: NONE
   Blur/filter: NONE in JS
   ========================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ---- Config ---- */
const IS_MOBILE  = window.innerWidth < 768;
const IS_REDUCED = matchMedia("(prefers-reduced-motion:reduce)").matches;

const EASE = {
    out:    "power4.out",
    smooth: "power3.inOut",
    back:   "back.out(1.5)",
    gentle: "power2.out",
};

/* ---- DOM ---- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const el = {
    nav:        $('#nav'),
    heroTag:    $('#heroTag'),
    heroTitle:  $('#heroHeading') || $('#heroTitle'),
    heroDesc:   $('#heroDesc'),
    heroActions:$('#heroActions'),
    heroStats:  $('#heroStats'),
    stats:      $$('.stat'),
    heroVisual: $('#heroVisual'),
    heroContent:$('#heroContent'),
    visualCard: $('#visualCard'),
    visualImg:  $('#visualImg'),
    chip1:      $('#chip1'),
    chip2:      $('#chip2'),
    scrollCue:  $('#scrollCue'),
    orbs:       $$('.hero-orb'),
    hero:       $('#hero'),
};

/* ===========================================================
   1. BUILD HEADING LETTERS
   =========================================================== */
function buildLetters() {
    const title = el.heroTitle;
    if (!title) return;

    const fragment = document.createDocumentFragment();

    "WELCOME ITZFIZZ".split(" ").forEach((word, i, arr) => {
        const wordSpan = document.createElement("span");
        wordSpan.className = "word";

        for (const char of word) {
            const letterSpan = document.createElement("span");
            letterSpan.className = "letter";
            letterSpan.textContent = char;
            wordSpan.appendChild(letterSpan);
        }

        fragment.appendChild(wordSpan);

        if (i < arr.length - 1) {
            fragment.appendChild(document.createElement("br"));
        }
    });

    title.appendChild(fragment);
}

buildLetters();

/* ===========================================================
   2. INITIAL STATES — transform + opacity only
   =========================================================== */
function setInitialStates() {
    gsap.set(el.nav,        { opacity: 0, y: -50 });
    gsap.set(el.heroTag,    { opacity: 0, y: 15 });
    gsap.set(el.heroDesc,   { opacity: 0, y: 20 });
    gsap.set(el.heroActions,{ opacity: 0, y: 20 });
    gsap.set(el.heroStats,  { opacity: 0 });
    gsap.set(el.stats,      { opacity: 0, y: 30 });
    gsap.set(el.heroVisual, { opacity: 0 });
    gsap.set(el.scrollCue,  { opacity: 0, y: 10 });
    gsap.set(el.orbs,       { opacity: 0 });
}

setInitialStates();

/* ===========================================================
   3. HERO ENTRANCE — Single master timeline
   =========================================================== */
function runHeroEntrance() {
    if (IS_REDUCED) {
        /* Show everything instantly */
        gsap.set([
            el.nav, el.heroTag, el.heroDesc, el.heroActions,
            el.heroStats, el.heroVisual, el.scrollCue,
            ...el.stats, ...el.orbs,
        ], { opacity: 1, y: 0, x: 0, scale: 1 });

        $$('.hero-title .letter').forEach(l => gsap.set(l, { opacity: 1, y: 0 }));
        animateCounters();
        initScrollAnimations();
        return;
    }

    const tl = gsap.timeline({
        defaults: { ease: EASE.out, force3D: true },
    });

    /* Navbar */
    tl.to(el.nav, { opacity: 1, y: 0, duration: .9 }, 0);

    /* Background orbs — just opacity, no blur */
    tl.to(el.orbs, {
        opacity: 1,
        duration: 2,
        stagger: .2,
        ease: EASE.gentle,
    }, 0);

    /* Tag */
    tl.to(el.heroTag, { opacity: 1, y: 0, duration: .8 }, .2);

    /* Letters — stagger from bottom with 3D rotation */
    const letters = $$('.hero-title .letter');
    tl.from(letters, {
        y: 100,
        rotationX: -80,
        opacity: 0,
        duration: IS_MOBILE ? .7 : 1.1,
        stagger: {
            each: IS_MOBILE ? .02 : .03,
            from: "start",
        },
        ease: "back.out(1.3)",
    }, .4);

    /* Description */
    tl.to(el.heroDesc, { opacity: 1, y: 0, duration: .9 }, 1.2);

    /* Actions */
    tl.to(el.heroActions, { opacity: 1, y: 0, duration: .8 }, 1.45);

    /* Stats container */
    tl.to(el.heroStats, { opacity: 1, duration: .3 }, 1.7);

    /* Each stat card — staggered */
    tl.to(el.stats, {
        opacity: 1,
        y: 0,
        duration: .9,
        stagger: .15,
        ease: "back.out(1.2)",
        onComplete: animateCounters,
    }, 1.8);

    /* Stat bars fill */
    tl.add(() => {
        $$('.stat-fill').forEach((bar, i) => {
            gsap.to(bar, {
                scaleX: parseInt(bar.dataset.width) / 100,
                duration: 1.2,
                delay: i * .1,
                ease: EASE.gentle,
            });
        });
    }, 2.3);

    /* Visual image */
    tl.to(el.heroVisual, { opacity: 1, duration: .4 }, .8);

    tl.from(el.visualCard, {
        x: IS_MOBILE ? 30 : 80,
        rotationY: IS_MOBILE ? -4 : -8,
        scale: .92,
        opacity: 0,
        duration: 1.3,
        ease: EASE.gentle,
        clearProps: "transform",
    }, .9);

    tl.to(el.visualImg, {
        scale: 1,
        duration: 2.5,
        ease: EASE.gentle,
    }, 1.1);

    /* Chips */
    if (!IS_MOBILE && el.chip1 && el.chip2) {
        tl.from(el.chip1, {
            opacity: 0, y: 20, scale: .85,
            duration: .7, ease: "back.out(2)",
        }, 2);
        tl.from(el.chip2, {
            opacity: 0, y: 20, scale: .85,
            duration: .7, ease: "back.out(2)",
        }, 2.15);
    }

    /* Scroll cue */
    tl.to(el.scrollCue, { opacity: 1, y: 0, duration: .7 }, 2.5);

    /* Start scroll animations after entrance */
    tl.add(() => initScrollAnimations(), 2.8);
}

/* ===========================================================
   4. COUNTER ANIMATION
   =========================================================== */
function animateCounters() {
    $$('.stat-val').forEach(v => {
        const target = parseInt(v.dataset.target);
        const proxy = { val: 0 };

        gsap.to(proxy, {
            val: target,
            duration: IS_REDUCED ? .01 : 2,
            ease: EASE.gentle,
            onUpdate() {
                v.textContent = Math.round(proxy.val);
            },
        });
    });
}

/* ===========================================================
   5. SCROLL ANIMATIONS — Minimal ScrollTrigger usage

   Total STs: 4
     1. Hero exit timeline (single ST)
     2. Navbar scroll class toggle
     3. Showcase reveal
     4. Contact reveal
   =========================================================== */
function initScrollAnimations() {

    /* ---- A) HERO EXIT — Single timeline, single ScrollTrigger ---- */
    const heroExit = gsap.timeline({ paused: true });

    /* Image slides left + scales */
    heroExit.to(el.visualImg, {
        x: IS_MOBILE ? -30 : -100,
        scale: IS_MOBILE ? 1.05 : 1.15,
        force3D: true,
    }, 0);

    /* Visual card drifts right + rotates */
    heroExit.to(el.visualCard, {
        x: IS_MOBILE ? 20 : 60,
        rotationZ: IS_MOBILE ? 1 : 2.5,
        scale: .94,
        force3D: true,
    }, 0);

    /* Content lifts up + fades */
    heroExit.to(el.heroContent, {
        y: IS_MOBILE ? -40 : -80,
        opacity: 0,
        force3D: true,
    }, 0);

    /* Letters scatter */
    const allLetters = $$('.hero-title .letter');
    heroExit.to(allLetters, {
        y: i => (i % 2 === 0 ? 1 : -1) * (20 + i * 3),
        x: i => (i % 2 === 0 ? 1 : -1) * (5 + i * 2),
        opacity: 0,
        stagger: .015,
        force3D: true,
    }, 0);

    /* Stats sink */
    heroExit.to(el.stats, {
        y: i => 40 + i * 15,
        opacity: 0,
        scale: .92,
        stagger: .04,
        force3D: true,
    }, 0);

    /* Chips fade */
    if (!IS_MOBILE && el.chip1 && el.chip2) {
        heroExit.to([el.chip1, el.chip2], {
            opacity: 0, y: -30, scale: .8,
            stagger: .05, force3D: true,
        }, 0);
    }

    /* Orbs drift */
    el.orbs.forEach((orb, i) => {
        heroExit.to(orb, {
            y: (i === 0 ? -80 : 60),
            x: (i === 0 ? 40 : -30),
            opacity: 0,
            force3D: true,
        }, 0);
    });

    /* Scroll cue fades early */
    heroExit.to(el.scrollCue, {
        opacity: 0, y: 15,
        force3D: true, duration: .25,
    }, 0);

    ScrollTrigger.create({
        trigger: el.hero,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        animation: heroExit,
    });

    /* ---- B) NAVBAR scroll class ---- */
    ScrollTrigger.create({
        trigger: el.hero,
        start: "60px top",
        onEnter: () => el.nav.classList.add("scrolled"),
        onLeaveBack: () => el.nav.classList.remove("scrolled"),
    });

    /* ---- C) SHOWCASE reveal ---- */
    const showcaseHeader = $('#showcaseHeader');
    const projectCards = $$('.project-card');

    if (showcaseHeader) {
        const showcaseTL = gsap.timeline({ paused: true });

        showcaseTL.to(showcaseHeader, {
            opacity: 1, y: 0,
            duration: 1, ease: EASE.out, force3D: true,
        });

        showcaseTL.to(projectCards, {
            opacity: 1, y: 0,
            duration: .9,
            stagger: .12,
            ease: "back.out(1.2)",
            force3D: true,
        }, .3);

        ScrollTrigger.create({
            trigger: '#showcase',
            start: "top 75%",
            end: "top 25%",
            scrub: 1,
            invalidateOnRefresh: true,
            animation: showcaseTL,
        });
    }

    /* ---- D) CONTACT reveal ---- */
    const contactEls = [
        $('#contactTitle'),
        $('#contactSub'),
        $('#contactBtn'),
    ].filter(Boolean);

    if (contactEls.length) {
        const contactTL = gsap.timeline({ paused: true });

        contactTL.to(contactEls, {
            opacity: 1, y: 0,
            stagger: .12,
            duration: 1,
            ease: EASE.out,
            force3D: true,
        });

        ScrollTrigger.create({
            trigger: '#contact',
            start: "top 70%",
            end: "top 25%",
            scrub: 1.2,
            invalidateOnRefresh: true,
            animation: contactTL,
        });
    }

    /* ---- Resize refresh (debounced, dimension-checked) ---- */
    let lastW = innerWidth;
    let lastH = innerHeight;
    let resizeTimer;

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (innerWidth !== lastW || innerHeight !== lastH) {
                lastW = innerWidth;
                lastH = innerHeight;
                ScrollTrigger.refresh();
            }
        }, 250);
    }, { passive: true });
}

/* ===========================================================
   6. START
   =========================================================== */
runHeroEntrance();