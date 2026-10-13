/* Cables and Wireless Co., site behaviour (v2). No scroll listeners: state changes come from IntersectionObserver. */

(function () {

    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");


    /* ---------- header: border once the page has scrolled ---------- */

    var header = document.getElementById("header");
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none";
    document.body.prepend(sentinel);

    if (header && "IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            header.classList.toggle("is-stuck", !entries[0].isIntersecting);
        }).observe(sentinel);
    }


    /* ---------- dark mode: the light versions can switch to the dark design ---------- */

    var root = document.documentElement;
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    var lightColor = themeMeta ? themeMeta.getAttribute("content") : "";
    var modeButtons = document.querySelectorAll("[data-mode-toggle]");

    function setMode(dark, save) {
        if (dark) root.setAttribute("data-mode", "dark"); else root.removeAttribute("data-mode");
        for (var i = 0; i < modeButtons.length; i++) modeButtons[i].setAttribute("aria-pressed", dark ? "true" : "false");
        if (themeMeta) themeMeta.setAttribute("content", dark ? "#0C0D0E" : lightColor);
        if (save) { try { localStorage.setItem("cw-mode", dark ? "dark" : "light"); } catch (e) {} }
    }

    setMode(root.getAttribute("data-mode") === "dark", false);
    for (var m = 0; m < modeButtons.length; m++) {
        modeButtons[m].addEventListener("click", function () {
            setMode(root.getAttribute("data-mode") !== "dark", true);
        });
    }


    /* ---------- mobile menu ---------- */

    var mobileButton = document.getElementById("mobileButton");
    var mobileNav = document.getElementById("mobileNav");

    function setMobile(open) {
        if (!mobileNav || !mobileButton) return;
        mobileNav.classList.toggle("open", open);
        mobileButton.setAttribute("aria-expanded", open ? "true" : "false");
        mobileButton.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
        document.body.style.overflow = open ? "hidden" : "";
    }

    if (mobileButton) {
        mobileButton.addEventListener("click", function () {
            setMobile(!mobileNav.classList.contains("open"));
        });
    }
    if (mobileNav) {
        mobileNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () { setMobile(false); });
        });
    }


    /* ---------- dropdowns (hover via CSS; click, keyboard and touch here) ---------- */

    var dropdowns = document.querySelectorAll(".nav-dropdown");

    function closeDropdown(d) {
        d.classList.remove("open");
        var t = d.querySelector(".nav-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
    }

    function closeAll(except) {
        dropdowns.forEach(function (d) { if (d !== except) closeDropdown(d); });
    }

    dropdowns.forEach(function (dropdown) {
        var toggle = dropdown.querySelector(".nav-toggle");
        if (toggle) {
            toggle.addEventListener("click", function (event) {
                event.stopPropagation();
                var open = !dropdown.classList.contains("open");
                closeAll(dropdown);
                dropdown.classList.toggle("open", open);
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }
        dropdown.addEventListener("mouseleave", function () { closeDropdown(dropdown); });
        dropdown.addEventListener("focusout", function (event) {
            if (!dropdown.contains(event.relatedTarget)) closeDropdown(dropdown);
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".nav-dropdown")) closeAll();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        var open = document.querySelector(".nav-dropdown.open");
        closeAll();
        if (open) {
            var t = open.querySelector(".nav-toggle");
            if (t) t.focus();
        }
        if (mobileNav && mobileNav.classList.contains("open")) {
            setMobile(false);
            mobileButton.focus();
        }
    });

    document.querySelectorAll(".dropdown-menu a").forEach(function (link) {
        link.addEventListener("click", function () {
            closeAll();
            if (document.activeElement) document.activeElement.blur();
        });
    });


    /* ---------- hero: four slides with labelled tabs ---------- */

    var hero = document.querySelector(".hero");
    var slides = document.querySelectorAll(".hero-slide");
    var tabs = document.querySelectorAll(".hero-tab");
    var previousButton = document.getElementById("heroPrev");
    var nextButton = document.getElementById("heroNext");
    var pauseButton = document.getElementById("heroPause");

    var INTERVAL = 7000;
    var current = 0;
    var timer = null;
    var userPaused = false;
    var holding = false;

    function showSlide(index) {
        if (!slides.length) return;
        index = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            var active = i === index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", active ? "false" : "true");
            slide.querySelectorAll("a").forEach(function (a) {
                if (active) a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1");
            });
        });
        tabs.forEach(function (tab, i) {
            var active = i === index;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", active ? "true" : "false");
            /* restart the progress line */
            var bar = tab.querySelector(".hero-tab-bar i");
            if (bar && active) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
        });
        current = index;
    }

    function canPlay() {
        return !userPaused && !holding && !reduceMotion.matches && !document.hidden;
    }

    function stop() {
        if (timer) { clearTimeout(timer); timer = null; }
        if (hero) hero.classList.remove("is-playing");
    }

    function play() {
        stop();
        if (slides.length < 2 || !canPlay()) return;
        hero.classList.add("is-playing");
        timer = setTimeout(function () { showSlide(current + 1); play(); }, INTERVAL);
    }

    function go(index) {
        if (hero) hero.classList.remove("is-static");
        showSlide(index);
        play();
    }

    function setPaused(paused) {
        userPaused = paused;
        if (pauseButton) {
            pauseButton.setAttribute("aria-pressed", paused ? "true" : "false");
            pauseButton.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
        }
        if (paused) stop(); else play();
    }

    if (hero && slides.length) {
        hero.style.setProperty("--slide-ms", INTERVAL + "ms");
        hero.classList.add("is-static");

        if (nextButton) nextButton.addEventListener("click", function () { go(current + 1); });
        if (previousButton) previousButton.addEventListener("click", function () { go(current - 1); });
        if (pauseButton) pauseButton.addEventListener("click", function () { setPaused(!userPaused); });

        tabs.forEach(function (tab, i) {
            tab.addEventListener("click", function () { go(i); });
            tab.addEventListener("keydown", function (event) {
                var k = event.key, n = null;
                if (k === "ArrowRight") n = i + 1;
                if (k === "ArrowLeft") n = i - 1;
                if (n === null) return;
                event.preventDefault();
                n = (n + tabs.length) % tabs.length;
                go(n);
                tabs[n].focus();
            });
        });

        var stage = hero.querySelector(".hero-stage");
        stage.addEventListener("mouseenter", function () { holding = true; stop(); });
        stage.addEventListener("mouseleave", function () { holding = false; play(); });
        hero.addEventListener("focusin", function () { holding = true; stop(); });
        hero.addEventListener("focusout", function (event) {
            if (!hero.contains(event.relatedTarget)) { holding = false; play(); }
        });

        var touchX = 0;
        stage.addEventListener("touchstart", function (event) { touchX = event.changedTouches[0].screenX; }, { passive: true });
        stage.addEventListener("touchend", function (event) {
            var d = event.changedTouches[0].screenX - touchX;
            if (Math.abs(d) > 50) go(d < 0 ? current + 1 : current - 1);
        }, { passive: true });

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) stop(); else play();
        });
        if (reduceMotion.addEventListener) {
            reduceMotion.addEventListener("change", function () { play(); });
        }

        /* pause while the hero is off screen */
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                holding = !entries[0].isIntersecting;
                if (holding) stop(); else play();
            }, { threshold: 0.25 }).observe(hero);
        }

        showSlide(0);
        if (reduceMotion.matches) setPaused(true); else play();
    }


    /* ---------- industries: tabs on wide screens ---------- */

    var solTabs = document.querySelectorAll(".sol-tab");
    var solPanels = document.querySelectorAll(".solution-item");

    function showIndustry(i, focus) {
        solTabs.forEach(function (t, j) {
            var on = i === j;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
            t.tabIndex = on ? 0 : -1;
            if (on && focus) t.focus();
        });
        solPanels.forEach(function (p, j) { p.classList.toggle("is-active", i === j); });
    }

    solTabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { showIndustry(i); });
        tab.addEventListener("keydown", function (event) {
            var n = null;
            if (event.key === "ArrowDown" || event.key === "ArrowRight") n = i + 1;
            if (event.key === "ArrowUp" || event.key === "ArrowLeft") n = i - 1;
            if (event.key === "Home") n = 0;
            if (event.key === "End") n = solTabs.length - 1;
            if (n === null) return;
            event.preventDefault();
            showIndustry((n + solTabs.length) % solTabs.length, true);
        });
    });


    /* ---------- current section in the main nav (homepage) ---------- */

    var navLinks = document.querySelectorAll(".main-nav .nav-link");
    var sections = document.querySelectorAll("main section[id]");

    if (sections.length && navLinks.length && "IntersectionObserver" in window) {
        var byId = {};
        navLinks.forEach(function (link) {
            var href = link.getAttribute("href") || "";
            var i = href.indexOf("#");
            if (i > -1 && href.slice(0, i).replace("./", "") === "index.html") byId[href.slice(i + 1)] = link;
        });
        var visible = {};
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
            var currentId = null;
            sections.forEach(function (s) { if (!currentId && visible[s.id] && byId[s.id]) currentId = s.id; });
            if (!currentId) return;
            navLinks.forEach(function (link) {
                var on = link === byId[currentId];
                link.classList.toggle("is-current", on);
                if (on) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        sections.forEach(function (s) { io.observe(s); });
    }


    /* ---------- contact form: opens the visitor's email app ---------- */

    var contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var phone = document.getElementById("phone").value;
            var message = document.getElementById("message").value;

            var subject = encodeURIComponent("Cables And Wireless Co. Website Enquiry - " + name);
            var body = encodeURIComponent(
                "Name: " + name +
                "\nEmail: " + email +
                "\nPhone: " + phone +
                "\n\nMessage:\n" + message
            );

            var status = document.getElementById("formStatus");
            if (status) {
                status.hidden = false;
                status.textContent = "Your email app should now open with this enquiry filled in. Press send there to deliver it. If nothing opened, email info@cnwcom.in directly.";
            }

            window.location.href = "mailto:info@cnwcom.in?subject=" + subject + "&body=" + body;
        });
    }


    /* ---------- current year ---------- */

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

})();
