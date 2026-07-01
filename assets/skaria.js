// skaria.js — Standalone Skaria Medical Center page renderer.
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return [...(root || document).querySelectorAll(sel)]; }

  const { CATEGORIES, CENTERS, PRACTITIONERS, TESTIMONIALS } = window.OM_DATA || {};

  const SERVICE_PLACEHOLDER_IMAGES = [
    "assets/herbs/hibiscus.jpg",
    "assets/herbs/guava.jpg",
    "assets/herbs/chamomile.jpg",
    "assets/herbs/cinnamon.jpg",
    "assets/herbs/turmeric.jpg",
    "assets/herbs/african-sausage-tree.jpg",
  ];

  function catName(id) {
    return ((CATEGORIES || []).find((c) => c.id === id) || {}).name || id;
  }

  function stars(n) {
    let s = "";
    for (let i = 0; i < Math.floor(n); i++) s += "★";
    if (n % 1 >= 0.5) s += "½";
    return s;
  }

  function pills(cats) {
    return `<div class="pill-row">${(cats || []).map((id) =>
      `<span class="pill" data-category="${id}">${catName(id)}</span>`).join("")}</div>`;
  }

  function sectionHead(eye, title, lede) {
    return `<div class="section-head">
      <p class="eyebrow">${eye}</p>
      <h2>${title}</h2>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
    </div>`;
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function initScrollReveal() {
    const items = $$(".reveal-up");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => obs.observe(el));
  }

  function initFlagshipGallery() {
    const gallery = $("[data-flagship-gallery]");
    if (!gallery) return;
    const slides = $$(".flagship-slide", gallery);
    const dots   = $$(".flagship-dot", gallery);
    if (slides.length < 2) return;
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle("is-active", si === index));
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
    }
    function next() { show(index + 1); }
    function prev() { show(index - 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 3800);
    }

    const nextBtn = $("[data-flagship-next]", gallery);
    const prevBtn = $("[data-flagship-prev]", gallery);
    if (nextBtn) nextBtn.addEventListener("click", () => { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); restart(); });
    dots.forEach((d) => d.addEventListener("click", () => { show(Number(d.dataset.flagshipDot)); restart(); }));
    gallery.addEventListener("mouseenter", () => timer && clearInterval(timer));
    gallery.addEventListener("mouseleave", restart);

    restart();
  }

  function initServicePhotoCards() {
    $$(".service-photo-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (window.matchMedia("(hover: hover)").matches) return;
        if (!card.classList.contains("is-open")) {
          e.preventDefault();
          $$(".service-photo-card.is-open").forEach((c) => { if (c !== card) c.classList.remove("is-open"); });
          card.classList.add("is-open");
        }
      });
      card.addEventListener("focus", () => card.classList.add("is-open"));
      card.addEventListener("blur", () => card.classList.remove("is-open"));
    });
  }

  function initScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    const tabs = $$(".skaria-tab");
    const secs = $$(".skaria-sec");
    const tabsRail = $(".skaria-tabs");
    if (!tabs.length || !secs.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((t) => t.classList.remove("is-active"));
        const match = tabs.find((t) => t.getAttribute("href") === "#" + e.target.id);
        if (match) {
          match.classList.add("is-active");
          if (tabsRail) {
            match.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          }
        }
      });
    }, { rootMargin: "-12% 0px -80% 0px", threshold: 0 });
    secs.forEach((s) => obs.observe(s));
  }

  function init() {
    const center = (CENTERS || []).find((c) => c.slug === "skaria");
    if (!center) return;

    const products = center.products || [];
    const flagship = products.find((p) => p.flagship);
    const blogs    = center.blogs    || [];
    const pracs    = (PRACTITIONERS || []).filter((p) => p.centerSlug === "skaria");
    const reviews  = (TESTIMONIALS  || []).filter((t) => t.centerSlug === "skaria");

    document.title = "Skaria Medical Center";

    const ov = center.overview || [];
    const visionText     = (ov.find((p) => /^Vision:/i.test(p))      || "").replace(/^Vision:\s*/i, "");
    const founderText    = (ov.find((p) => /^Founder:/i.test(p))     || "").replace(/^Founder:\s*/i, "");
    const specialtyText  = (ov.find((p) => /^Specialties/i.test(p))  || "").replace(/^Specialties include\s*/i, "");
    const integratesText = (ov.find((p) => /^Skaria integrates/i.test(p)) || "");
    const missionText    = center.description;

    const expTags = (center.services || []).slice(0, 8).map((s) => {
      const short = s.name
        .replace(/\s*(Program|Management|Treatment|Support|Stabilization|Care|Reset)\s*$/i, "")
        .trim();
      return `<span class="exp-tag">${short}</span>`;
    }).join("");

    // ── Skaria header ──
    const headerEl = document.querySelector('[data-site-header]');
    if (headerEl) {
      headerEl.innerHTML = `
        <div class="container header-inner">
          <a href="index.html" class="sk-brand" aria-label="Skaria Medical Center home">
            <img src="assets/skaria-logo.png" alt="" class="sk-nav-logo" aria-hidden="true" />
            Skaria <em>Medical Center</em>
          </a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="skariaMainNav" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
          <nav class="site-nav" id="skariaMainNav" aria-label="Primary">
            <a href="#services" class="nav-link">Services</a>
            <a href="#overview" class="nav-link">Overview</a>
            <a href="#why" class="nav-link">Why Skaria</a>
            <a href="#shop" class="nav-link">Shop</a>
            <a href="#team" class="nav-link">Team</a>
            <a href="#reviews" class="nav-link">Reviews</a>
            <a href="#journal" class="nav-link">Journal</a>
            <a href="#contact" class="nav-link">Contact</a>
          </nav>
          <div class="header-actions">
            <a href="https://wa.me/${center.contact.whatsapp}" target="_blank" rel="noopener" class="btn btn-amber btn-sm" aria-label="Message Skaria on WhatsApp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378L.436 23.033l1.653-6.033a9.886 9.886 0 0 1-1.322-4.94C.769 5.94 5.73.978 11.843.978c3.054 0 5.918 1.19 8.073 3.348A11.337 11.337 0 0 1 23.26 12.37c0 6.114-4.96 11.076-11.073 11.076"/><path d="M.001 11.63C0 13.634.523 15.594 1.513 17.316L0 23.998l6.844-1.793a11.1 11.1 0 0 0 5.306 1.352h.005c6.114 0 11.074-4.961 11.074-11.075A11.006 11.006 0 0 0 11.845.01C5.731.01.002 4.97.002 11.085z"/></svg>
              <span class="btn-label-long">WhatsApp</span>
            </a>
          </div>
        </div>
      `;
      const toggle = headerEl.querySelector('.nav-toggle');
      const nav    = headerEl.querySelector('#skariaMainNav');
      if (toggle && nav) {
        toggle.addEventListener('click', () => {
          const open = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!open));
          nav.classList.toggle('is-open', !open);
        });
        nav.querySelectorAll('.nav-link').forEach((link) => {
          link.addEventListener('click', () => {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('is-open');
          });
        });
      }
    }

    const hero    = $("#skariaHero");
    const content = $("#skariaContent");
    if (!hero || !content) return;

    hero.innerHTML = `
      <div class="container skaria-hero-centered">
        <div class="skaria-logo-wrap">
          <img src="assets/skaria-logo.png" alt="Skaria Medical" class="skaria-logo-img" />
        </div>
        <h1 class="skaria-title">Skaria<em>Medical Center</em></h1>
        <p class="skaria-tagline">${center.tagline}</p>
        ${expTags ? `<div class="exp-tags-row" aria-label="Areas of care">${expTags}</div>` : ""}
        ${pills(center.categories)}
        <div class="profile-hero-actions">
          <a class="btn btn-amber" href="#contact">Book a consultation</a>
          <a class="btn btn-outline-light" href="#services">Explore services</a>
          <button class="btn btn-outline-light skaria-share-btn" id="skariaShareBtn" aria-label="Share this page">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>
      </div>

      <div class="container skaria-hero-stats-strip" aria-label="Skaria at a glance">
        <div class="hero-stat">
          <span class="star" aria-hidden="true">${stars(center.rating)}</span>
          <span class="hero-stat-num">${center.rating}</span>
          <span class="hero-stat-label">${center.reviewCount} reviews</span>
        </div>
        <div class="hero-stat"><span class="hero-stat-num">${center.stats.practitioners}</span><span class="hero-stat-label">Practitioners</span></div>
        <div class="hero-stat"><span class="hero-stat-num">${center.stats.services}</span><span class="hero-stat-label">Services</span></div>
        <div class="hero-stat"><span class="hero-stat-num">${center.stats.yearsActive}+</span><span class="hero-stat-label">Years active</span></div>
      </div>
    `;

    const NAV = [
      { id: "services", label: "Services" },
      { id: "overview", label: "Overview" },
      { id: "why",      label: "Why Skaria" },
      { id: "shop",     label: "Shop"     },
      { id: "team",     label: "Team"     },
      { id: "reviews",  label: "Reviews"  },
      { id: "journal",  label: "Journal"  },
      { id: "contact",  label: "Contact"  },
    ];

    content.innerHTML = `

      <!-- IN-PAGE NAV -->
      <nav class="skaria-in-page-nav" id="skariaNav" aria-label="Section navigation">
        <div class="container">
          <ul class="skaria-tabs" role="list">
            ${NAV.map((n, i) =>
              `<li><a href="#${n.id}" class="skaria-tab${i === 0 ? " is-active" : ""}">${n.label}</a></li>`
            ).join("")}
          </ul>
        </div>
      </nav>

      <!-- SERVICES -->
      <section class="section skaria-sec" id="services">
        <div class="container">
          ${sectionHead("Programs", "Services &amp; consults", "Integrative sessions for nutrition, movement, and supportive botanicals designed to fit your life. Hover a card for details.")}
          <div class="service-photo-grid">${center.services.map((s, i) => `
            <article class="service-photo-card reveal-up" tabindex="0" style="background-image:url('${SERVICE_PLACEHOLDER_IMAGES[i % SERVICE_PLACEHOLDER_IMAGES.length]}');transition-delay:${Math.min(i, 6) * 0.06}s">
              <div class="service-photo-title">${s.name}</div>
              <div class="service-photo-hover">
                <div class="service-photo-badges">
                  <span class="emvi-badge">${s.duration}</span>
                  <span class="emvi-badge">${s.price}</span>
                </div>
                <p class="service-photo-desc">${s.description}</p>
                <div class="service-photo-actions">
                  <a class="btn-photo btn-photo--ghost" href="#contact">Learn more</a>
                  <a class="btn-photo btn-photo--solid" href="#contact">Book now</a>
                </div>
              </div>
            </article>`).join("")}
          </div>
        </div>
      </section>

      <!-- OVERVIEW -->
      <section class="section skaria-sec" id="overview">
        <div class="container">
          ${sectionHead("About us", "Skaria Medical Center", "")}
          <div class="skaria-about-grid">
            <div class="skaria-about-text reveal-up">
              <div class="vm-grid">
                <article class="vm-card vm-card--mission">
                  <p class="vm-label">Mission</p>
                  <p class="vm-body">${missionText}</p>
                </article>
                ${visionText ? `
                <article class="vm-card vm-card--vision">
                  <p class="vm-label">Vision</p>
                  <p class="vm-body">${visionText}</p>
                </article>` : ""}
              </div>
              <div class="about-kpis">
                <div class="about-kpi-card">
                  <span class="about-kpi-label">Practitioners</span>
                  <span class="about-kpi-value">${center.stats.practitioners}</span>
                </div>
                <div class="about-kpi-card">
                  <span class="about-kpi-label">Services</span>
                  <span class="about-kpi-value">${center.stats.services}</span>
                </div>
                <div class="about-kpi-card">
                  <span class="about-kpi-label">Products</span>
                  <span class="about-kpi-value">${products.length || "—"}</span>
                </div>
                <div class="about-kpi-card">
                  <span class="about-kpi-label">Years active</span>
                  <span class="about-kpi-value">${center.stats.yearsActive}+</span>
                </div>
              </div>
              ${integratesText ? `<div class="integrates-strip"><p>${integratesText}</p></div>` : ""}
              <div class="profile-hero-actions">
                <a class="btn btn-amber" href="#services">Explore services</a>
                <a class="btn btn-outline-light" href="#contact">Book a consult</a>
              </div>
            </div>
            <div class="skaria-about-media reveal-up">
              <div class="skaria-about-photo-wrap${pracs[0] && pracs[0].photo ? '' : ' sk-marble-bg'}">
                ${pracs[0] && pracs[0].photo
                  ? `<img src="${pracs[0].photo}" alt="${pracs[0].firstName} ${pracs[0].lastName}" class="skaria-about-photo" />`
                  : `<img src="assets/skaria-logo.png" alt="Skaria Medical" class="skaria-about-logo" />`
                }
              </div>
              ${founderText ? `
              <div class="founder-strip">
                <div>
                  <span class="founder-label">Founder</span>
                  <p class="founder-body">${founderText}</p>
                </div>
              </div>` : ''}
            </div>
          </div>
        </div>
      </section>

      <!-- WHY SKARIA -->
      <section class="section band-paper-deep skaria-sec" id="why">
        <div class="container">
          ${sectionHead("Why Skaria", "What sets us apart", "")}
          <div class="why-grid">
            <div class="why-cards">
              <article class="why-card reveal-up">
                <h3>Certified practitioners</h3>
                <p>${center.stats.practitioners} specialists blending African herbalism and Western clinical medicine, active for ${center.stats.yearsActive}+ years.</p>
              </article>
              ${specialtyText ? `
              <article class="why-card reveal-up" style="transition-delay:0.08s">
                <h3>Tailored care plans</h3>
                <p>Specialties include ${specialtyText}</p>
              </article>` : ""}
              <article class="why-card reveal-up" style="transition-delay:0.16s">
                <h3>Telehealth access</h3>
                <p>Appointments ${center.contact.hours}, reachable by WhatsApp, phone, or video from anywhere.</p>
              </article>
            </div>
            <div class="why-media reveal-up">
              <div class="why-media-collage">
                <img src="assets/herbs/turmeric.jpg" alt="Turmeric" class="why-media-tile why-media-tile--a" loading="lazy" />
                <img src="assets/herbs/aloe-vera.jpg" alt="Aloe vera" class="why-media-tile why-media-tile--b" loading="lazy" />
                <img src="assets/herbs/honey.jpg" alt="Raw honey" class="why-media-tile why-media-tile--c" loading="lazy" />
                <img src="assets/skaria-logo.png" alt="Skaria Medical" class="why-media-logo" />
              </div>
            </div>
          </div>
          <div class="profile-hero-actions">
            <a class="btn btn-amber" href="#team">Meet the team</a>
            <a class="btn btn-outline-light" href="#contact">Book now</a>
          </div>
        </div>
      </section>

      <!-- SHOP -->
      <section class="skaria-shop skaria-sec" id="shop">
        <div class="skaria-shop-inner">
          <div class="container">
            ${sectionHead("Shop", "Our products", "Traditional herbal blends, wellness supports, and clinical-grade protocols from Skaria&rsquo;s catalog.")}
            ${flagship ? `
            <article class="flagship-card reveal-up" aria-label="Flagship product: ${flagship.name}">
              <div class="flagship-gallery" data-flagship-gallery>
                ${(flagship.gallery || [flagship.image]).map((src, gi) => `
                  <img src="${src}" alt="${flagship.name} photo ${gi + 1}" class="flagship-slide${gi === 0 ? ' is-active' : ''}" loading="${gi === 0 ? 'eager' : 'lazy'}" />
                `).join("")}
                ${(flagship.gallery || []).length > 1 ? `
                <button type="button" class="flagship-arrow flagship-arrow--prev" data-flagship-prev aria-label="Previous photo">&lsaquo;</button>
                <button type="button" class="flagship-arrow flagship-arrow--next" data-flagship-next aria-label="Next photo">&rsaquo;</button>
                <div class="flagship-dots" data-flagship-dots>
                  ${(flagship.gallery || []).map((_, gi) => `<button type="button" class="flagship-dot${gi === 0 ? ' is-active' : ''}" data-flagship-dot="${gi}" aria-label="Show photo ${gi + 1}"></button>`).join("")}
                </div>` : ""}
              </div>
              <div class="flagship-body">
                <span class="flagship-badge">Flagship product</span>
                <h3 class="flagship-title">${flagship.name}</h3>
                <p class="flagship-desc">${flagship.description}</p>
                <div class="emvi-p-tags"><span class="emvi-tag">${flagship.category}</span></div>
                <div class="flagship-benefits">
                  <div class="flagship-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Live probiotic cultures that support daily digestion
                  </div>
                  <div class="flagship-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Easier to digest thanks to its A2 casein profile
                  </div>
                  <div class="flagship-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Fermented in small batches at Skaria
                  </div>
                </div>
                <p class="flagship-note"><strong>How to enjoy:</strong> chilled on its own, or blended into smoothies and porridge.</p>
                <div class="flagship-actions">
                  <a class="btn btn-amber" href="https://wa.me/${center.contact.whatsapp}?text=${encodeURIComponent('Hi, I am interested in ' + flagship.name)}" target="_blank" rel="noopener">Order on WhatsApp</a>
                  <a class="btn btn-outline-light" href="#contact">Ask a question</a>
                </div>
              </div>
            </article>` : ""}
            ${products.length
              ? `<div class="emvi-shop-grid">${products.filter((p) => !p.flagship).map((p, i) => `
                <article class="emvi-product-card reveal-up" style="transition-delay:${Math.min(i, 6) * 0.06}s">
                  <div class="emvi-p-image${p.image ? '' : ' sk-marble-bg'}">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}" class="emvi-p-img" loading="lazy" />` : ''}
                    <div class="emvi-p-actions">
                      <button class="emvi-icon-pill" aria-label="Save ${p.name}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#319795" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                      <a class="emvi-icon-pill" href="https://wa.me/${center.contact.whatsapp}?text=${encodeURIComponent('Hi, I am interested in ' + p.name)}" target="_blank" rel="noopener" aria-label="Ask about ${p.name} on WhatsApp">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </a>
                    </div>
                  </div>
                  <div class="emvi-p-body">
                    <div class="emvi-p-tags"><span class="emvi-tag">${p.category}</span></div>
                    <div class="emvi-p-title-row">
                      <div class="emvi-p-title">${p.name}</div>
                      <div class="emvi-p-price">${p.price}</div>
                    </div>
                    <div class="emvi-p-desc">${p.description}</div>
                    <div class="emvi-p-btns">
                      <a class="emvi-cta-btn" href="#contact">Inquire</a>
                    </div>
                  </div>
                </article>`).join("")}</div>`
              : `<p class="shop-empty">No products listed yet.</p>`
            }
          </div>
        </div>
      </section>

      <!-- TEAM -->
      <section class="section band-paper-deep skaria-sec" id="team">
        <div class="container">
          ${sectionHead("Team", "Practitioners", "")}
          <div class="team-grid">${
            pracs.length
              ? pracs.map((p, i) => `
                <article class="team-card reveal-up" style="transition-delay:${Math.min(i, 6) * 0.08}s">
                  ${p.photo
                    ? `<img src="${p.photo}" alt="${p.firstName} ${p.lastName}" class="team-photo" />`
                    : `<div class="team-avatar" aria-hidden="true">${p.firstName[0]}${p.lastName[0]}</div>`
                  }
                  <h3>${p.firstName} ${p.lastName}</h3>
                  <p class="role">${p.role}</p>
                  <p class="credentials">${p.credentials}</p>
                  <p class="bio">${p.bio}</p>
                  ${p.linkedin ? `<a class="team-linkedin" href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${p.firstName} on LinkedIn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>` : ''}
                </article>`).join("")
              : `<p class="tab-empty">Practitioner profiles coming soon.</p>`
          }</div>
        </div>
      </section>

      <!-- REVIEWS -->
      <section class="section skaria-sec" id="reviews">
        <div class="container">
          ${sectionHead("Testimonials", "Patient voices", "")}
          <div class="profile-testimonials">${
            reviews.length
              ? reviews.map((t, i) => `
                <article class="testimonial-card reveal-up" style="transition-delay:${Math.min(i, 6) * 0.08}s">
                  <span class="quote-mark" aria-hidden="true">&ldquo;</span>
                  <blockquote>${t.quote}</blockquote>
                  <footer>
                    <span class="author">${t.author}</span>
                    <span class="context">${t.context}</span>
                  </footer>
                </article>`).join("")
              : `<p class="tab-empty">No testimonials yet.</p>`
          }</div>
        </div>
      </section>

      <!-- JOURNAL -->
      <section class="section band-paper-deep skaria-sec" id="journal">
        <div class="container">
          ${sectionHead("Journal", "Blog", "")}
          ${blogs.length
            ? `<div class="emvi-blog-grid">${blogs.map((b, i) => `
              <article class="emvi-blog-card reveal-up"${b.image ? ` style="background-image:url('${b.image}');transition-delay:${Math.min(i, 6) * 0.08}s"` : ` style="transition-delay:${Math.min(i, 6) * 0.08}s"`}>
                <div class="emvi-blog-content">
                  <div class="emvi-blog-label">${b.readMin} min read &middot; ${b.author.split(',')[0]}</div>
                  <h3 class="emvi-blog-title">${b.title}</h3>
                  <p class="emvi-blog-desc">${b.excerpt}</p>
                  <div class="emvi-blog-footer">
                    <span class="emvi-blog-date">${fmtDate(b.date)}</span>
                    <span class="emvi-blog-read">Read &rarr;</span>
                  </div>
                </div>
              </article>`).join("")}</div>`
            : `<p class="tab-empty">No blog posts yet.</p>`
          }
        </div>
      </section>

      <!-- CONTACT -->
      <section class="section skaria-sec" id="contact">
        <div class="container">
          ${sectionHead("Contact", "Get in touch", "Reach out by email or stop by one of our telehealth sessions &mdash; Monday through Saturday.")}
          <div class="skaria-contact-card">
            <dl class="contact-list">
              <div><dt>Email</dt><dd><a href="mailto:${center.contact.email}">${center.contact.email}</a></dd></div>
              <div><dt>US (Google Voice)</dt><dd><a href="tel:${center.contact.phone.replace(/\D/g, '')}">${center.contact.phone}</a></dd></div>
              <div><dt>WhatsApp</dt><dd><a href="https://wa.me/${center.contact.whatsapp}">+254 795 920 217</a></dd></div>
              <div><dt>Address</dt><dd>${center.contact.address}</dd></div>
              <div><dt>Hours</dt><dd>${center.contact.hours}</dd></div>
            </dl>
            <div class="contact-cta-col">
              <p class="contact-blurb">
                Skaria Medical Center offers telehealth appointments Monday through Saturday.
                Send us a message and we&rsquo;ll get back to you within one business day.
              </p>
              <div class="skaria-contact-actions">
                <a class="btn btn-primary" href="mailto:${center.contact.email}?subject=${encodeURIComponent('Skaria inquiry')}" target="_blank" rel="noopener">Email Skaria</a>
                <a class="btn btn-whatsapp" href="https://wa.me/${center.contact.whatsapp}?text=${encodeURIComponent('Hi, I would like to inquire about Skaria Medical Center.')}" target="_blank" rel="noopener">&#128172; WhatsApp Us</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    initScrollSpy();
    initScrollReveal();
    initFlagshipGallery();
    initServicePhotoCards();
    requestAnimationFrame(() => hero.classList.add("is-visible"));

    // ── Skaria footer ──
    const footerEl = document.querySelector('[data-site-footer]');
    if (footerEl) {
      footerEl.innerHTML = `
        <div class="container sk-footer-inner">
          <div class="sk-footer-brand">
            <img src="assets/skaria-logo.png" alt="Skaria Medical Center" class="sk-footer-logo" />
            <p class="sk-footer-name">Skaria <em>Medical Center</em></p>
            <p class="sk-footer-tagline">${center.tagline}</p>
            <div class="sk-footer-socials">
              <a href="https://wa.me/${center.contact.whatsapp}" target="_blank" rel="noopener" class="sk-footer-social" aria-label="WhatsApp">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378L.436 23.033l1.653-6.033a9.886 9.886 0 0 1-1.322-4.94C.769 5.94 5.73.978 11.843.978c3.054 0 5.918 1.19 8.073 3.348A11.337 11.337 0 0 1 23.26 12.37c0 6.114-4.96 11.076-11.073 11.076"/><path d="M.001 11.63C0 13.634.523 15.594 1.513 17.316L0 23.998l6.844-1.793a11.1 11.1 0 0 0 5.306 1.352h.005c6.114 0 11.074-4.961 11.074-11.075A11.006 11.006 0 0 0 11.845.01C5.731.01.002 4.97.002 11.085z"/></svg>
              </a>
              <a href="mailto:${center.contact.email}" class="sk-footer-social" aria-label="Email">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              </a>
            </div>
          </div>
          <div class="sk-footer-col">
            <h4>Navigate</h4>
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#why">Why Skaria</a></li>
              <li><a href="#shop">Shop</a></li>
              <li><a href="#team">Team</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#journal">Journal</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div class="sk-footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:${center.contact.email}">${center.contact.email}</a></li>
              <li><a href="https://wa.me/${center.contact.whatsapp}">+254 795 920 217 (WhatsApp)</a></li>
              <li><a href="tel:${center.contact.phone.replace(/\D/g, '')}">${center.contact.phone}</a></li>
              <li>${center.contact.address}</li>
            </ul>
          </div>
          <div class="sk-footer-col">
            <h4>Hours</h4>
            <p>${center.contact.hours}</p>
          </div>
        </div>
        <div class="sk-footer-bottom">
          <div class="container">
            <span>&copy; 2026 Skaria Medical Center. All rights reserved.</span>
            <span>Telehealth &middot; Nairobi, Kenya</span>
          </div>
        </div>
      `;
    }

    // Share button
    const shareBtn = document.getElementById("skariaShareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const shareData = {
          title: "Skaria Medical Center",
          text: "Check out Skaria Medical Center — holistic telehealth blending African herbalism and Western clinical medicine.",
          url: window.location.href,
        };
        if (navigator.share) {
          try { await navigator.share(shareData); } catch (_) {}
        } else {
          await navigator.clipboard.writeText(window.location.href);
          shareBtn.textContent = "Link copied!";
          setTimeout(() => {
            shareBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share`;
          }, 2000);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
