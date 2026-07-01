// oneMedicare static frontend — renders shared chrome and page sections from OM_DATA.

(function () {
  const { CATEGORIES, VALUE_PROPS, CENTERS, PRACTITIONERS, TESTIMONIALS, PLATFORM_CONTACT } = window.OM_DATA;

  // ---------- helpers ----------
  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  function catById(id) { return CATEGORIES.find((c) => c.id === id); }
  function catName(id) { return catById(id)?.name || id; }
  function centerBySlug(slug) { return CENTERS.find((c) => c.slug === slug); }
  function featuredCenter() { return CENTERS.find((c) => c.featured) || CENTERS[0]; }
  function centerProfileHref(center) {
    return center.slug === "skaria"
      ? "index.html"
      : `center.html?slug=${encodeURIComponent(center.slug)}`;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function gmailUrl(to, subject, body) {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function whatsappUrl(phone, text) {
    return `https://wa.me/${String(phone).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }

  function contactMessageLines(fields) {
    const lines = [`Name: ${fields.name}`, `Email: ${fields.email}`];
    if (fields.phone) lines.push(`Phone: ${fields.phone}`);
    lines.push("", fields.message);
    return lines.join("\n");
  }

  function channelButtonsHtml(contact, getFields) {
    return `
      <button type="button" class="btn btn-gmail btn-sm" data-channel="gmail">
        <span aria-hidden="true">✉</span> Open in Gmail
      </button>
      <button type="button" class="btn btn-whatsapp btn-sm" data-channel="whatsapp">
        <span aria-hidden="true">💬</span> Chat on WhatsApp
      </button>
    `;
  }

  function bindContactChannels(container, contact, subjectPrefix, getFields) {
    container.querySelector('[data-channel="gmail"]')?.addEventListener("click", () => {
      const fields = getFields();
      if (!fields.name || !fields.email || !fields.message) {
        container.querySelector("form")?.reportValidity();
        return;
      }
      const subject = `${subjectPrefix} from ${fields.name}`;
      window.open(gmailUrl(contact.email, subject, contactMessageLines(fields)), "_blank", "noopener");
    });

    container.querySelector('[data-channel="whatsapp"]')?.addEventListener("click", () => {
      const fields = getFields();
      const phone = contact.whatsapp || contact.phone;
      if (!phone) return;
      const text = fields.message
        ? `Hi, I'm ${fields.name}. ${fields.message}`
        : `Hi, I'd like to get in touch. My name is ${fields.name || "a visitor"}.`;
      window.open(whatsappUrl(phone, text), "_blank", "noopener");
    });
  }

  function contactFormHtml(idPrefix, opts = {}) {
    const heading = opts.heading || "Send a message";
    const intro = opts.intro || "Fill out the form, then open Gmail or WhatsApp with your message ready to send.";
    return `
      <h3>${heading}</h3>
      ${intro ? `<p class="lede" style="margin-top:var(--space-3);font-size:0.92rem">${intro}</p>` : ""}
      <form class="contact-form" id="${idPrefix}Form" novalidate>
        <div class="field">
          <label for="${idPrefix}Name">Full name</label>
          <input id="${idPrefix}Name" name="name" type="text" required autocomplete="name" />
        </div>
        <div class="field">
          <label for="${idPrefix}Email">Email</label>
          <input id="${idPrefix}Email" name="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="${idPrefix}Phone">Phone (optional)</label>
          <input id="${idPrefix}Phone" name="phone" type="tel" autocomplete="tel" />
        </div>
        <div class="field">
          <label for="${idPrefix}Message">Message</label>
          <textarea id="${idPrefix}Message" name="message" required rows="4" placeholder="How can we help?"></textarea>
        </div>
        <div class="contact-form-actions">
          <button type="submit" class="btn btn-primary">Send via Gmail</button>
        </div>
        <div class="channel-buttons" data-channels>${channelButtonsHtml()}</div>
      </form>
      <div class="form-confirm" id="${idPrefix}Confirm" role="status" aria-live="polite">
        <strong>Ready to send.</strong> Your message was prepared. Check Gmail or WhatsApp if a tab did not open.
      </div>
    `;
  }

  function readContactFields(prefix) {
    return {
      name: $(`#${prefix}Name`)?.value.trim() || "",
      email: $(`#${prefix}Email`)?.value.trim() || "",
      phone: $(`#${prefix}Phone`)?.value.trim() || "",
      message: $(`#${prefix}Message`)?.value.trim() || "",
    };
  }

  function setupContactForm(prefix, contact, subjectPrefix) {
    const form = $(`#${prefix}Form`);
    if (!form) return;
    const wrap = form.closest(".sidebar-card, .contact-split-form, .tab-panel") || form.parentElement;

    bindContactChannels(wrap, contact, subjectPrefix, () => readContactFields(prefix));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const fields = readContactFields(prefix);
      const subject = `${subjectPrefix} from ${fields.name}`;
      window.open(gmailUrl(contact.email, subject, contactMessageLines(fields)), "_blank", "noopener");
      $(`#${prefix}Confirm`)?.classList.add("is-visible");
    });
  }

  function stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let s = "";
    for (let i = 0; i < full; i++) s += "★";
    if (half) s += "½";
    return s;
  }

  function categoryIcon(id) {
    const icons = {
      psychology: '<path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 3 4.58V17a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4.42A5 5 0 0 0 17 8V7a5 5 0 0 0-5-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/>',
      nutrition: '<path d="M12 22c4-4 7-8 7-13a7 7 0 1 0-14 0c0 5 3 9 7 13z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 9v4M10 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
      holistic: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>',
      wellness: '<path d="M12 3l2.4 4.8L20 9l-4 3.9.9 5.6L12 16.5 7.1 18.5 8 12.9 4 9l5.6-1.2L12 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
      "physical-therapy": '<path d="M4 16l4-8 4 4 4-6 4 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id] || icons.holistic}</svg>`;
  }

  function pillHtml(catId) {
    return `<span class="pill" data-category="${catId}">${catName(catId)}</span>`;
  }

  function pillsHtml(cats) {
    return `<div class="pill-row">${cats.map(pillHtml).join("")}</div>`;
  }

  function stampHtml(catId) {
    return `<span class="card-stamp" data-category="${catId}">${categoryIcon(catId)}</span>`;
  }

  // ---------- header / footer ----------
  function renderHeader() {
    const el = $("[data-site-header]");
    if (!el) return;
    const active = el.getAttribute("data-active") || "";

    el.innerHTML = `
      <div class="container header-inner">
        <a href="directory.html" class="brand" aria-label="oneMedicare home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/></svg>
          </span>
          one<em>Medicare</em>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <nav class="site-nav" id="siteNav" aria-label="Primary">
          <a href="directory.html" class="nav-link${active === "home" ? " is-active" : ""}">Home</a>
          <a href="centers.html" class="nav-link${active === "centers" ? " is-active" : ""}">Centers</a>
          <a href="onboard.html" class="nav-link${active === "onboard" ? " is-active" : ""}">Onboard</a>
        </nav>
        <div class="header-actions">
          <a href="centers.html" class="btn btn-ghost btn-sm">Browse centers</a>
          <a href="onboard.html" class="btn btn-amber btn-sm"><span class="btn-label-long">List your center</span><span class="visually-hidden">, </span><span aria-hidden="true">Apply</span></a>
        </div>
      </div>
    `;

    const toggle = $(".nav-toggle", el);
    const nav = $("#siteNav", el);
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    $$(".nav-link", nav).forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  function renderFooter() {
    const el = $("[data-site-footer]");
    if (!el) return;
    el.innerHTML = `
      <div class="container footer-top">
        <div class="footer-brand">
          <a href="directory.html" class="brand">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/></svg>
            </span>
            one<em>Medicare</em>
          </a>
          <p>A multi-tenant health &amp; wellness platform for hospitals, practices, and the people they care for.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="directory.html">Home</a></li>
            <li><a href="centers.html">Center directory</a></li>
            <li><a href="index.html">Skaria profile</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><a href="onboard.html">Onboard a center</a></li>
            <li><a href="centers.html">Browse by category</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Categories</h4>
          <ul>
            ${CATEGORIES.map((c) => `<li><a href="centers.html?category=${c.id}">${c.name}</a></li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© 2026 oneMedicare</span>
        <span>Static preview · Phase 01</span>
      </div>
    `;
  }

  // ---------- center card ----------
  function centerCardHtml(c, opts = {}) {
    const primaryCat = c.categories[0];
    const featuredClass = c.featured && opts.featuredStyle ? " is-featured" : "";
    return `
      <article class="center-card reveal${featuredClass}" data-category="${primaryCat}">
        <div class="card-top">
          <span class="catalog-tag">${c.catalogNo}</span>
          ${stampHtml(primaryCat)}
        </div>
        <h3><a href="${centerProfileHref(c)}">${c.name}</a></h3>
        <p class="card-location">${c.location}</p>
        <p class="card-tagline">${c.tagline}</p>
        ${pillsHtml(c.categories)}
        <div class="card-highlights" aria-label="Center highlights">
          <span><strong>${c.stats.practitioners}</strong> practitioners</span>
          <span><strong>${c.stats.services}</strong> services</span>
        </div>
        <div class="card-footer">
          <span class="card-rating"><span class="star" aria-hidden="true">${stars(c.rating)}</span> ${c.rating} <span class="card-reviews">(${c.reviewCount} reviews)</span></span>
          <a href="${centerProfileHref(c)}" class="card-link">View profile →</a>
        </div>
      </article>
    `;
  }

  function featuredPrimaryHtml(c) {
    return `
      <article class="featured-primary reveal" data-category="${c.categories[0]}">
        <div class="card-top">
          <span class="catalog-tag">Featured · ${c.catalogNo}</span>
          ${stampHtml(c.categories[0])}
        </div>
        <h3><a href="${centerProfileHref(c)}" style="color:inherit">${c.name}</a></h3>
        <p class="card-tagline">${c.description}</p>
        ${pillsHtml(c.categories)}
        <div class="card-footer">
          <span class="card-rating"><span class="star">${stars(c.rating)}</span> ${c.rating} (${c.reviewCount} reviews)</span>
          <a href="${centerProfileHref(c)}" class="card-link">View profile →</a>
        </div>
      </article>
    `;
  }

  // ---------- home ----------
  function initHome() {
    initHeroScene3D($("#homeHeroScene"));

    const valueGrid = $("#valueGrid");
    if (valueGrid) {
      valueGrid.innerHTML = VALUE_PROPS.map(
        (v) => `
        <article class="ledger-item reveal">
          <span class="ledger-no">№ ${v.no}</span>
          <h3>${v.title}</h3>
          <p>${v.body}</p>
        </article>`
      ).join("");
    }

    const categoryGrid = $("#categoryGrid");
    if (categoryGrid) {
      categoryGrid.innerHTML = CATEGORIES.map((cat) => {
        const count = CENTERS.filter((c) => c.categories.includes(cat.id)).length;
        return `
          <a href="centers.html?category=${cat.id}" class="category-tile reveal" data-category="${cat.id}">
            <span class="category-icon">${categoryIcon(cat.id)}</span>
            <h3>${cat.name}</h3>
            <p class="category-short">${cat.short}</p>
            <span class="category-count">${count} center${count !== 1 ? "s" : ""}</span>
          </a>`;
      }).join("");
    }

    const featuredLayout = $("#featuredLayout");
    if (featuredLayout) {
      const featured = featuredCenter();
      const others = CENTERS.filter((c) => c.slug !== featured.slug).slice(0, 2);
      featuredLayout.innerHTML = `
        ${featuredPrimaryHtml(featured)}
        <div class="featured-secondary">
          ${others.map((c) => centerCardHtml(c, { featuredStyle: true })).join("")}
        </div>`;
    }

    const testimonialGrid = $("#testimonialGrid");
    if (testimonialGrid) {
      const platform = TESTIMONIALS.filter((t) => !t.centerSlug && t.featured);
      testimonialGrid.innerHTML = platform
        .map(
          (t) => `
        <article class="testimonial-card reveal">
          <span class="quote-mark" aria-hidden="true">"</span>
          <blockquote>${t.quote}</blockquote>
          <footer>
            <span class="author">${t.author}</span>
            <span class="context">${t.context}</span>
          </footer>
        </article>`
        )
        .join("");
    }
  }

  // ---------- directory ----------
  function initDirectory() {
    const grid = $("#centerGrid");
    if (!grid) return;

    const filterRow = $("#filterPills");
    const searchInput = $("#centerSearch");
    const heroSearch = $("#heroSearch");
    const metaEl = $("#directoryMeta");
    const emptyEl = $("#emptyState");

    initCentersLanding(heroSearch, searchInput);

    const params = new URLSearchParams(location.search);
    let activeCategory = params.get("category") || "all";
    let searchQuery = "";

    function centersInCategory() {
      if (activeCategory === "all") return CENTERS;
      return CENTERS.filter((c) => c.categories.includes(activeCategory));
    }

    function filteredCenters() {
      const list = centersInCategory();
      if (!searchQuery.trim()) return list;
      const q = searchQuery.toLowerCase();
      return list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.categories.some((id) => catName(id).toLowerCase().includes(q))
      );
    }

    function renderFilters() {
      const pills = [
        { id: "all", label: "All centers" },
        ...CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
      ];
      filterRow.innerHTML = pills
        .map(
          (p) => `
        <button type="button" class="filter-pill${activeCategory === p.id ? " is-active" : ""}"
          data-filter="${p.id}"${p.id !== "all" ? ` data-category="${p.id}"` : ""}>
          ${p.label}
        </button>`
        )
        .join("");
    }

    function render() {
      const list = filteredCenters();
      metaEl.textContent = `Showing ${list.length} center${list.length !== 1 ? "s" : ""}${activeCategory !== "all" ? ` in ${catName(activeCategory)}` : " across all categories"}${searchQuery ? ` for “${searchQuery}”` : ""}`;

      if (list.length === 0) {
        grid.innerHTML = "";
        emptyEl.classList.add("is-visible");
        emptyEl.setAttribute("aria-hidden", "false");
      } else {
        emptyEl.classList.remove("is-visible");
        emptyEl.setAttribute("aria-hidden", "true");
        grid.innerHTML = list.map((c) => centerCardHtml(c)).join("");
        observeReveals(grid);
      }
    }

    function setSearch(val) {
      searchQuery = val;
      if (searchInput) searchInput.value = val;
      if (heroSearch) heroSearch.value = val;
      render();
      if (val && $("#browse")) {
        $("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    renderFilters();
    render();

    filterRow.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      activeCategory = btn.getAttribute("data-filter");
      filterRow.querySelectorAll(".filter-pill").forEach((p) => {
        p.classList.toggle("is-active", p === btn);
      });
      const url = new URL(location.href);
      if (activeCategory === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", activeCategory);
      history.replaceState(null, "", url);
      render();
    });

    searchInput?.addEventListener("input", (e) => setSearch(e.target.value));
    heroSearch?.addEventListener("input", (e) => setSearch(e.target.value));

    $("#clearFilters")?.addEventListener("click", () => {
      activeCategory = "all";
      setSearch("");
      history.replaceState(null, "", "centers.html");
      renderFilters();
      render();
    });

    if (location.hash === "#browse") {
      requestAnimationFrame(() => $("#browse")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function glassCoreHtml(c) {
    const badge = c.featured ? '<span class="glass-core__badge">Featured</span>' : "";
    return `
      <div class="glass-core__shine" aria-hidden="true"></div>
      <header class="glass-core__head">
        <span class="glass-core__catalog">${c.catalogNo}${badge}</span>
        <h3>${c.name}</h3>
        <p class="glass-core__tagline">${c.tagline}</p>
      </header>
      <dl class="glass-core__facts">
        <div><dt>Location</dt><dd>${c.location}</dd></div>
        <div><dt>Rating</dt><dd>${c.rating} <span class="star" aria-hidden="true">${stars(c.rating)}</span></dd></div>
        <div><dt>Practitioners</dt><dd>${c.stats.practitioners}</dd></div>
        <div><dt>Services</dt><dd>${c.stats.services}</dd></div>
      </dl>
      ${pillsHtml(c.categories)}
      <p class="glass-core__stats">${c.reviewCount} reviews · ${c.stats.yearsActive} years active</p>
      <a href="${centerProfileHref(c)}" class="btn btn-amber btn-sm btn-block">Explore ${c.name}</a>
    `;
  }

  function floatCardHtml(c, idx, active) {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const slots =
      width <= 760
        ? [
            { top: "8%", left: "6%", z: 55, delay: 0 },
            { top: "8%", right: "6%", z: 70, delay: 1 },
          ]
        : width <= 1080
          ? [
              { top: "7%", left: "4%", z: 55, delay: 0 },
              { top: "7%", right: "4%", z: 75, delay: 1 },
              { bottom: "10%", left: "5%", z: 40, delay: 2 },
            ]
          : [
              { top: "8%", left: "4%", z: 50, delay: 0 },
              { top: "5%", right: "5%", z: 80, delay: 1 },
              { bottom: "14%", left: "7%", z: 30, delay: 2 },
              { bottom: "11%", right: "4%", z: 60, delay: 3 },
            ];
    const s = slots[idx % slots.length];
    const pos = [
      s.top ? `top:${s.top}` : "",
      s.bottom ? `bottom:${s.bottom}` : "",
      s.left ? `left:${s.left}` : "",
      s.right ? `right:${s.right}` : "",
    ]
      .filter(Boolean)
      .join(";");
    return `
      <button type="button" class="float-card${active ? " is-active" : ""}" role="option"
        aria-selected="${active}" data-slug="${c.slug}" data-category="${c.categories[0]}"
        style="${pos};--z:${s.z}px;--delay:${s.delay}">
        <span class="float-card__catalog">${c.catalogNo}</span>
        <strong>${c.name}</strong>
        <span class="float-card__meta">${c.location} · ${c.rating}★</span>
      </button>`;
  }

  function initHeroScene3D(scene) {
    if (!scene) return;

    const stage = $("[data-scene-stage]", scene);
    const orbit = $("[data-scene-orbit]", scene);
    const core = $("[data-glass-core]", scene);
    if (!stage || !orbit || !core) return;

    function getShowcaseCenters() {
      const width = window.innerWidth || document.documentElement.clientWidth;
      const maxCards = width <= 760 ? 2 : width <= 1080 ? 3 : 4;
      return [featuredCenter(), ...CENTERS.filter((c) => !c.featured).slice(0, maxCards - 1)];
    }

    let showcaseCenters = getShowcaseCenters();

    function setActive(slug) {
      const center = centerBySlug(slug) || showcaseCenters[0];
      orbit.querySelectorAll(".float-card").forEach((card) => {
        const on = card.getAttribute("data-slug") === center.slug;
        card.classList.toggle("is-active", on);
        card.setAttribute("aria-selected", String(on));
      });
      core.classList.add("is-updating");
      core.setAttribute("data-category", center.categories[0]);
      requestAnimationFrame(() => {
        core.innerHTML = glassCoreHtml(center);
        core.classList.remove("is-updating");
      });
    }

    function renderOrbit(preferredSlug) {
      showcaseCenters = getShowcaseCenters();
      const chosen = showcaseCenters.find((c) => c.slug === preferredSlug) || showcaseCenters[0];
      orbit.innerHTML = showcaseCenters.map((c, i) => floatCardHtml(c, i, c.slug === chosen.slug)).join("");
      setActive(chosen.slug);
    }

    renderOrbit(showcaseCenters[0].slug);

    orbit.addEventListener("click", (e) => {
      const card = e.target.closest("[data-slug]");
      if (!card) return;
      setActive(card.getAttribute("data-slug"));
    });

    orbit.addEventListener("keydown", (e) => {
      const cards = $$(".float-card", orbit);
      const idx = cards.findIndex((c) => c.classList.contains("is-active"));
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = cards[(idx + 1) % cards.length];
        setActive(next.getAttribute("data-slug"));
        next.focus();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = cards[(idx - 1 + cards.length) % cards.length];
        setActive(prev.getAttribute("data-slug"));
        prev.focus();
      }
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const activeSlug = orbit.querySelector(".float-card.is-active")?.getAttribute("data-slug");
        renderOrbit(activeSlug);
      }, 120);
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let targetRX = 0;
    let targetRY = 0;
    let curRX = 0;
    let curRY = 0;

    function onPointer(clientX, clientY) {
      const rect = scene.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      targetRY = px * 16;
      targetRX = py * -12;
      scene.style.setProperty("--mx", px.toFixed(3));
      scene.style.setProperty("--my", py.toFixed(3));
    }

    scene.addEventListener("mousemove", (e) => onPointer(e.clientX, e.clientY));
    scene.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );

    scene.addEventListener("mouseleave", () => {
      targetRX = 0;
      targetRY = 0;
      scene.style.setProperty("--mx", "0");
      scene.style.setProperty("--my", "0");
    });

    (function tick() {
      curRX += (targetRX - curRX) * 0.07;
      curRY += (targetRY - curRY) * 0.07;
      stage.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      requestAnimationFrame(tick);
    })();
  }

  function initCentersLanding(heroSearch, searchInput) {
    initHeroScene3D($("#centersHeroScene"));

    const heroMeta = $("#centersHeroMeta");
    if (heroMeta) {
      const avgRating = (CENTERS.reduce((s, c) => s + c.rating, 0) / CENTERS.length).toFixed(1);
      heroMeta.innerHTML = `
        <div class="hero-meta-item">
          <span class="num">${CENTERS.length}</span>
          <span class="label">Centers live</span>
        </div>
        <div class="hero-meta-item">
          <span class="num">${CATEGORIES.length}</span>
          <span class="label">Categories</span>
        </div>
        <div class="hero-meta-item">
          <span class="num">${avgRating}</span>
          <span class="label">Avg rating</span>
        </div>
      `;
    }

    const statsEl = $("#centersStats");
    if (statsEl) {
      const avgRating = (CENTERS.reduce((s, c) => s + c.rating, 0) / CENTERS.length).toFixed(1);
      statsEl.innerHTML = [
        { num: CENTERS.length, label: "Centers live" },
        { num: CATEGORIES.length, label: "Categories" },
        { num: avgRating, label: "Avg rating" },
        { num: CENTERS.filter((c) => c.categories.length > 1).length, label: "Multi-category" },
      ]
        .map(
          (s) => `
        <div class="stat-strip-item">
          <span class="num">${s.num}</span>
          <span class="label">${s.label}</span>
        </div>`
        )
        .join("");
    }

    const catStrip = $("#centersCategoryStrip");
    if (catStrip) {
      catStrip.innerHTML = CATEGORIES.map((cat) => {
        const count = CENTERS.filter((c) => c.categories.includes(cat.id)).length;
        return `
          <a href="centers.html?category=${cat.id}#browse" class="category-tile" data-category="${cat.id}">
            <span class="category-icon">${categoryIcon(cat.id)}</span>
            <h3>${cat.name}</h3>
            <p class="category-short">${cat.short}</p>
            <span class="category-count">${count} center${count !== 1 ? "s" : ""}</span>
          </a>`;
      }).join("");
    }

    const testimonialsEl = $("#centersTestimonials");
    if (testimonialsEl) {
      testimonialsEl.innerHTML = TESTIMONIALS.filter((t) => !t.centerSlug && t.featured)
        .slice(0, 3)
        .map(
          (t) => `
        <article class="testimonial-card reveal">
          <span class="quote-mark" aria-hidden="true">"</span>
          <blockquote>${t.quote}</blockquote>
          <footer>
            <span class="author">${t.author}</span>
            <span class="context">${t.context}</span>
          </footer>
        </article>`
        )
        .join("");
    }

    const platformBtns = $("#platformChannelBtns");
    if (platformBtns) {
      platformBtns.innerHTML = channelButtonsHtml(PLATFORM_CONTACT);
      bindContactChannels(platformBtns.parentElement, PLATFORM_CONTACT, "oneMedicare inquiry", () =>
        readContactFields("platform")
      );
    }

    const platformForm = $("#platformContactForm");
    if (platformForm) {
      platformForm.innerHTML = contactFormHtml("platform", {
        heading: "Contact oneMedicare",
        intro: "Ask about onboarding, pricing, or platform features.",
      });
      setupContactForm("platform", PLATFORM_CONTACT, "oneMedicare inquiry");
    }
  }

  // ---------- center profile ----------
  function initCenterProfile() {
    const root = $("#centerProfile");
    if (!root) return;

    const params = new URLSearchParams(location.search);
    const slug = params.get("slug") || root.getAttribute("data-center-slug") || "skaria";
    const center = centerBySlug(slug) || featuredCenter();
    const products = center.products || [];
    const blogs = center.blogs || [];

    document.title = `${center.name} | oneMedicare`;

    const pracs = PRACTITIONERS.filter((p) => p.centerSlug === center.slug);
    const reviews = TESTIMONIALS.filter((t) => t.centerSlug === center.slug);
    const related = CENTERS.filter(
      (c) => c.slug !== center.slug && c.categories.some((id) => center.categories.includes(id))
    ).slice(0, 3);

    const contactInfo = {
      email: center.contact.email,
      phone: center.contact.phone,
      whatsapp: center.contact.whatsapp || center.contact.phone,
    };

    const isSkaria = center.slug === "skaria";

    const tabs = isSkaria
      ? [
          { id: "offerings", label: "Offerings" },
          { id: "services", label: "Services" },
          { id: "products", label: "Products" },
          { id: "about", label: "About" },
          { id: "team", label: "Team" },
          { id: "schedule", label: "Schedule" },
          { id: "reviews", label: "Reviews" },
          { id: "blog", label: "Blog" },
          { id: "contact", label: "Contact" },
        ]
      : [
          { id: "about", label: "About" },
          { id: "services", label: "Services" },
          { id: "team", label: "Team" },
          { id: "schedule", label: "Schedule" },
          { id: "products", label: "Products" },
          { id: "blog", label: "Blog" },
          { id: "reviews", label: "Reviews" },
          { id: "contact", label: "Contact" },
        ];

    $("#profileHero").innerHTML = `
      <div class="container profile-hero-inner">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="centers.html">Centers</a>
            <span aria-hidden="true">/</span>
            <span>${center.name}</span>
          </nav>
          <p class="profile-catalog">${center.catalogNo} · ${center.location}</p>
          <h1>${center.name}</h1>
          ${pillsHtml(center.categories)}
          <p class="lede">${center.description}</p>
          <div class="profile-hero-actions">
            <button type="button" class="btn btn-amber" data-tab-link="contact">Book a visit</button>
            <a href="centers.html" class="btn btn-outline-light">Back to directory</a>
          </div>
        </div>
        <aside class="profile-stats-card" aria-label="Center statistics">
          <div class="rating-line">
            <span class="star" aria-hidden="true">${stars(center.rating)}</span>
            ${center.rating}
          </div>
          <p class="rating-count">${center.reviewCount} patient reviews</p>
          <div class="stat-row">
            <div><span class="num">${center.stats.practitioners}</span><span class="label">Practitioners</span></div>
            <div><span class="num">${center.stats.services}</span><span class="label">Services</span></div>
            <div><span class="num">${center.stats.yearsActive}</span><span class="label">Years active</span></div>
          </div>
        </aside>
      </div>
    `;

    const scheduleHtml = `
      <div class="schedule-table-wrap">
        <table class="schedule-table">
          <caption class="visually-hidden">Weekly schedule preview for ${center.name}</caption>
          <thead>
            <tr><th scope="col">Day</th><th scope="col">Available slots</th></tr>
          </thead>
          <tbody>
            ${center.schedule
              .map(
                (row) => `
              <tr>
                <th scope="row">${row.day}</th>
                <td>
                  ${
                    row.slots.length
                      ? row.slots
                          .map(
                            (s) => `
                      <div class="schedule-slot">
                        <span class="schedule-time">${s.time}</span>
                        <span>${s.service}</span>
                        <span class="schedule-with">with ${s.practitioner}</span>
                      </div>`
                          )
                          .join("")
                      : '<span class="schedule-empty">No open slots</span>'
                  }
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;

    const highlightedServices = center.services.slice(0, 3);
    const highlightedProducts = products.slice(0, 4);
    const firstOpenSlot = center.schedule.find((row) => row.slots.length)?.slots[0];

    const panels = {
      offerings: `
        <section class="tab-panel is-active" id="panel-offerings" role="tabpanel" aria-labelledby="tab-offerings">
          <p class="eyebrow">Shop &amp; Book</p>
          <h2>Products and services, at a glance</h2>
          <p class="lede">Explore the catalog first, then book a visit when you’re ready.</p>

          <div class="offerings-grid" style="margin-top:var(--space-7)">
            <article class="offerings-card">
              <div class="offerings-head">
                <h3>Services</h3>
                <button type="button" class="btn btn-ghost btn-sm" data-tab-link="services">View all</button>
              </div>
              <div class="service-list">
                ${center.services
                  .slice(0, 5)
                  .map(
                    (s) => `
                  <article class="service-row">
                    <div class="service-info">
                      <h3>${s.name}</h3>
                      <p>${s.description}</p>
                    </div>
                    <div class="service-meta">
                      <span class="price">${s.price}</span>
                      <span class="duration">${s.duration}</span>
                    </div>
                  </article>`
                  )
                  .join("")}
              </div>
            </article>
            <article class="offerings-card">
              <div class="offerings-head">
                <h3>Products</h3>
                <button type="button" class="btn btn-ghost btn-sm" data-tab-link="products">View all</button>
              </div>
              ${
                products.length
                  ? `<div class="product-grid">${products
                      .slice(0, 6)
                      .map(
                        (p) => `
                    <article class="product-card">
                      <span class="product-cat">${p.category}</span>
                      <h3>${p.name}</h3>
                      <p>${p.description}</p>
                      <div class="product-card-foot">
                        <span class="price">${p.price}</span>
                        <button type="button" class="btn btn-ghost btn-sm" data-tab-link="contact">Inquire</button>
                      </div>
                    </article>`
                      )
                      .join("")}</div>`
                  : `<p class="tab-empty">No products listed for this center yet.</p>`
              }
            </article>
          </div>
        </section>`,
      about: `
        <section class="tab-panel${isSkaria ? "" : " is-active"}" id="panel-about" role="tabpanel" aria-labelledby="tab-about"${isSkaria ? " hidden" : ""}>
          <p class="eyebrow">Overview</p>
          <h2>About ${center.name}</h2>
          <div class="overview-text">${center.overview.map((p) => `<p>${p}</p>`).join("")}</div>
          <div class="about-kpis" aria-label="Center highlights">
            <article class="about-kpi-card">
              <span class="about-kpi-label">Practitioners</span>
              <span class="about-kpi-value">${center.stats.practitioners}</span>
            </article>
            <article class="about-kpi-card">
              <span class="about-kpi-label">Services</span>
              <span class="about-kpi-value">${center.stats.services}</span>
            </article>
            <article class="about-kpi-card">
              <span class="about-kpi-label">Products</span>
              <span class="about-kpi-value">${products.length || "-"}</span>
            </article>
            <article class="about-kpi-card">
              <span class="about-kpi-label">Rating</span>
              <span class="about-kpi-value">${center.rating}</span>
            </article>
          </div>
          <div class="about-inline-grid">
            <article class="about-inline-card">
              <h3>Signature services</h3>
              <ul class="about-mini-list">
                ${highlightedServices
                  .map(
                    (s) => `
                  <li>
                    <span class="name">${s.name}</span>
                    <span class="meta">${s.duration} · ${s.price}</span>
                  </li>`
                  )
                  .join("")}
              </ul>
            </article>
            <article class="about-inline-card">
              <h3>Products</h3>
              ${
                highlightedProducts.length
                  ? `<ul class="about-mini-list">${highlightedProducts
                      .map(
                        (p) => `
                    <li>
                      <span class="name">${p.name}</span>
                      <span class="meta">${p.category} · ${p.price}</span>
                    </li>`
                      )
                      .join("")}</ul>`
                  : '<p class="about-empty-note">No products listed yet.</p>'
              }
            </article>
          </div>
          <div class="about-next-slot">
            <h3>Next available sample slot</h3>
            <p>${
              firstOpenSlot
                ? `${firstOpenSlot.time} · ${firstOpenSlot.service} with ${firstOpenSlot.practitioner}`
                : "No open sample slots listed yet."
            }</p>
          </div>
        </section>`,
      services: `
        <section class="tab-panel" id="panel-services" role="tabpanel" aria-labelledby="tab-services" hidden>
          <p class="eyebrow">Services</p>
          <h2>What they offer</h2>
          <div class="service-list">${center.services
            .map(
              (s) => `
            <article class="service-row">
              <div class="service-info">
                <h3>${s.name}</h3>
                <p>${s.description}</p>
              </div>
              <div class="service-meta">
                <span class="price">${s.price}</span>
                <span class="duration">${s.duration}</span>
              </div>
            </article>`
            )
            .join("")}</div>
        </section>`,
      team: `
        <section class="tab-panel" id="panel-team" role="tabpanel" aria-labelledby="tab-team" hidden>
          <p class="eyebrow">Team</p>
          <h2>Practitioners</h2>
          <div class="team-grid">${
            pracs.length
              ? pracs
                  .map(
                    (p) => `
              <article class="team-card">
                <div class="team-avatar" aria-hidden="true">${p.firstName[0]}${p.lastName[0]}</div>
                <h3>${p.firstName} ${p.lastName}</h3>
                <p class="role">${p.role}</p>
                <p class="credentials">${p.credentials}</p>
                <p class="bio">${p.bio}</p>
              </article>`
                  )
                  .join("")
              : `<p class="tab-empty">Practitioner profiles coming soon.</p>`
          }</div>
        </section>`,
      schedule: `
        <section class="tab-panel" id="panel-schedule" role="tabpanel" aria-labelledby="tab-schedule" hidden>
          <p class="eyebrow">Schedule</p>
          <h2>This week's preview</h2>
          <p class="lede">Sample availability. Booking connects to tenant scheduling in production.</p>
          ${scheduleHtml}
        </section>`,
      products: `
        <section class="tab-panel" id="panel-products" role="tabpanel" aria-labelledby="tab-products" hidden>
          <p class="eyebrow">Shop</p>
          <h2>Products</h2>
          ${
            products.length
              ? `<div class="product-grid">${products
                  .map(
                    (p) => `
                <article class="product-card">
                  <span class="product-cat">${p.category}</span>
                  <h3>${p.name}</h3>
                  <p>${p.description}</p>
                  <div class="product-card-foot">
                    <span class="price">${p.price}</span>
                    <button type="button" class="btn btn-ghost btn-sm" data-tab-link="contact">Inquire</button>
                  </div>
                </article>`
                  )
                  .join("")}</div>`
              : `<p class="tab-empty">No products listed for this center yet.</p>`
          }
        </section>`,
      blog: `
        <section class="tab-panel" id="panel-blog" role="tabpanel" aria-labelledby="tab-blog" hidden>
          <p class="eyebrow">Journal</p>
          <h2>Blog</h2>
          ${
            blogs.length
              ? `<div class="blog-list">${blogs
                  .map(
                    (b) => `
                <article class="blog-card">
                  <p class="blog-card-meta">${formatDate(b.date)} · ${b.author} · ${b.readMin} min read</p>
                  <h3>${b.title}</h3>
                  <p>${b.excerpt}</p>
                  <span class="blog-card-link">Read article →</span>
                </article>`
                  )
                  .join("")}</div>`
              : `<p class="tab-empty">No blog posts published yet.</p>`
          }
        </section>`,
      reviews: `
        <section class="tab-panel" id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" hidden>
          <p class="eyebrow">Testimonials</p>
          <h2>Patient voices</h2>
          <div class="profile-testimonials">${
            reviews.length
              ? reviews
                  .map(
                    (t) => `
              <article class="testimonial-card">
                <span class="quote-mark" aria-hidden="true">"</span>
                <blockquote>${t.quote}</blockquote>
                <footer>
                  <span class="author">${t.author}</span>
                  <span class="context">${t.context}</span>
                </footer>
              </article>`
                  )
                  .join("")
              : `<p class="tab-empty">No testimonials yet for this center.</p>`
          }</div>
        </section>`,
      contact: `
        <section class="tab-panel" id="panel-contact" role="tabpanel" aria-labelledby="tab-contact" hidden>
          <p class="eyebrow">Contact</p>
          <h2>Get in touch with ${center.name}</h2>
          <dl class="contact-list" style="margin-top:var(--space-5)">
            <div><dt>Email</dt><dd><a href="mailto:${center.contact.email}">${center.contact.email}</a></dd></div>
            <div><dt>Phone</dt><dd><a href="tel:${center.contact.phone.replace(/\D/g, "")}">${center.contact.phone}</a></dd></div>
            <div><dt>Address</dt><dd>${center.contact.address}</dd></div>
            <div><dt>Hours</dt><dd>${center.contact.hours}</dd></div>
          </dl>
          <div class="sidebar-card" style="margin-top:var(--space-6);padding:var(--space-5)">
            ${contactFormHtml("center", {
              heading: "Send a message",
              intro: "Submit opens Gmail with your message ready. Use WhatsApp for a quick chat.",
            })}
          </div>
        </section>`,
    };

    $("#profileTabs").innerHTML = tabs
      .map(
        (t, i) => `
      <button type="button" class="profile-tab${i === 0 ? " is-active" : ""}" role="tab"
        id="tab-${t.id}" aria-selected="${i === 0}" aria-controls="panel-${t.id}" data-tab="${t.id}">
        ${t.label}
      </button>`
      )
      .join("");

    $("#tabPanels").innerHTML = tabs.map((t) => panels[t.id]).join("");

    const spotlight = $("#profileSpotlight");
    if (spotlight && isSkaria) {
      spotlight.innerHTML = `
        <div class="container spotlight-inner">
          <div class="spotlight-copy">
            <p class="spotlight-eyebrow">Signature catalog</p>
            <h2>Herbal protocols + modern clinical care</h2>
            <p class="lede">Browse what Skaria offers first. Services and remedies are designed to fit real daily rhythm—food, movement, and supportive botanicals.</p>
            <div class="spotlight-actions">
              <button type="button" class="btn btn-amber" data-tab-link="offerings">Explore offerings</button>
              <button type="button" class="btn btn-outline-light" data-tab-link="contact">Talk to the team</button>
            </div>
          </div>
          <div class="spotlight-cards" aria-label="Featured products and services">
            <article class="spotlight-card">
              <h3>Top services</h3>
              <ul class="about-mini-list">
                ${highlightedServices
                  .map(
                    (s) => `
                  <li>
                    <span class="name">${s.name}</span>
                    <span class="meta">${s.duration} · ${s.price}</span>
                  </li>`
                  )
                  .join("")}
              </ul>
              <button type="button" class="btn btn-ghost btn-sm" data-tab-link="services" style="margin-top:var(--space-4)">View all services →</button>
            </article>
            <article class="spotlight-card">
              <h3>Top products</h3>
              ${
                highlightedProducts.length
                  ? `<ul class="about-mini-list">${highlightedProducts
                      .map(
                        (p) => `
                    <li>
                      <span class="name">${p.name}</span>
                      <span class="meta">${p.category} · ${p.price}</span>
                    </li>`
                      )
                      .join("")}</ul>`
                  : '<p class="about-empty-note">No products listed yet.</p>'
              }
              <button type="button" class="btn btn-ghost btn-sm" data-tab-link="products" style="margin-top:var(--space-4)">View all products →</button>
            </article>
          </div>
        </div>
      `;
    }

    $("#profileSidebar").innerHTML = `
      <aside class="sidebar-card">
        <h3>Quick contact</h3>
        <dl class="contact-list">
          <div><dt>Email</dt><dd><a href="mailto:${center.contact.email}">${center.contact.email}</a></dd></div>
          <div><dt>Hours</dt><dd>${center.contact.hours}</dd></div>
        </dl>
        <div class="sidebar-channels" id="sidebarChannels">
          ${channelButtonsHtml(contactInfo)}
        </div>
        <button type="button" class="btn btn-primary btn-block" data-tab-link="contact" style="margin-top:var(--space-4)">Open contact form</button>
      </aside>
      ${
        related.length
          ? `
      <aside class="sidebar-card">
        <h3>Related centers</h3>
        <div class="related-list">
          ${related
            .map(
              (c) => `
            <a href="${centerProfileHref(c)}" class="related-item">
              <span>
                <span class="related-name">${c.name}</span>
                <span class="related-cat">${c.categories.map(catName).join(" · ")}</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>`
            )
            .join("")}
        </div>
      </aside>`
          : ""
      }
    `;

    setupContactForm("center", contactInfo, `${center.name} inquiry`);

    bindContactChannels($("#sidebarChannels"), contactInfo, `${center.name} inquiry`, () => {
      const fields = readContactFields("center");
      if (!fields.name && !fields.message) {
        return { name: "Visitor", email: fields.email || "visitor@example.com", phone: fields.phone, message: `I'd like to connect with ${center.name}.` };
      }
      return fields;
    });

    bindContactChannels($("#panel-contact"), contactInfo, `${center.name} inquiry`, () => readContactFields("center"));

    let activeTab = tabs.some((t) => t.id === location.hash.slice(1))
      ? location.hash.slice(1)
      : isSkaria
        ? "offerings"
        : "about";

    function switchTab(tabId) {
      activeTab = tabId;
      $$(".profile-tab").forEach((btn) => {
        const on = btn.getAttribute("data-tab") === tabId;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
      });
      $$(".tab-panel").forEach((panel) => {
        const on = panel.id === `panel-${tabId}`;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
      history.replaceState(null, "", `${location.pathname}${location.search}#${tabId}`);
    }

    $("#profileTabs").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      switchTab(btn.getAttribute("data-tab"));
    });

    root.addEventListener("click", (e) => {
      const link = e.target.closest("[data-tab-link]");
      if (!link) return;
      e.preventDefault();
      switchTab(link.getAttribute("data-tab-link"));
      $("#panel-contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    switchTab(activeTab);
  }

  // ---------- onboard ----------
  function initOnboard() {
    const form = $("#onboardForm");
    if (!form) return;

    const steps = $$(".form-step", form);
    const stepNav = $("#stepNav");
    const reviewPanel = $("#reviewPanel");
    let currentStep = 0;
    const state = { categories: [], services: [] };

    function categoryCheckboxes() {
      return CATEGORIES.map(
        (cat) => `
        <label class="check-pill" data-category="${cat.id}">
          <input type="checkbox" name="categories" value="${cat.id}" />
          <span>${cat.name}</span>
        </label>`
      ).join("");
    }

    $("#categoryGrid").innerHTML = `<div class="checkbox-grid">${categoryCheckboxes()}</div>`;

    function serviceRowHtml(i, data = {}) {
      return `
        <div class="dynamic-row" data-service-row>
          <span class="row-label">Service ${i + 1}</span>
          <button type="button" class="remove-row" aria-label="Remove service ${i + 1}">Remove</button>
          <div class="form-grid form-grid--2">
            <div class="field">
              <label>Service name</label>
              <input type="text" class="service-name" value="${data.name || ""}" placeholder="e.g. Initial consultation" />
            </div>
            <div class="field">
              <label>Duration</label>
              <input type="text" class="service-duration" value="${data.duration || ""}" placeholder="60 min" />
            </div>
          </div>
          <div class="field" style="margin-top:1rem">
            <label>Description</label>
            <textarea class="service-desc" rows="2" placeholder="Brief description">${data.description || ""}</textarea>
          </div>
        </div>`;
    }

    const serviceList = $("#serviceList");
    let serviceCount = 1;
    serviceList.innerHTML = serviceRowHtml(0);

    $("#addService")?.addEventListener("click", () => {
      serviceList.insertAdjacentHTML("beforeend", serviceRowHtml(serviceCount));
      serviceCount++;
      relabelServiceRows();
    });

    serviceList.addEventListener("click", (e) => {
      if (!e.target.classList.contains("remove-row")) return;
      const rows = $$("[data-service-row]", serviceList);
      if (rows.length <= 1) return;
      e.target.closest("[data-service-row]").remove();
      relabelServiceRows();
    });

    function updateStepNav() {
      $$(".step-nav-item", stepNav).forEach((item, i) => {
        item.classList.toggle("is-active", i === currentStep);
        item.classList.toggle("is-done", i < currentStep);
        item.setAttribute("aria-current", i === currentStep ? "step" : "false");
      });
      steps.forEach((s, i) => {
        s.hidden = i !== currentStep;
      });
    }

    function collectServices() {
      return $$("[data-service-row]", serviceList)
        .map((row) => ({
          name: row.querySelector(".service-name")?.value.trim(),
          duration: row.querySelector(".service-duration")?.value.trim(),
          description: row.querySelector(".service-desc")?.value.trim(),
        }))
        .filter((s) => s.name);
    }

    function relabelServiceRows() {
      $$("[data-service-row]", serviceList).forEach((row, i) => {
        row.querySelector(".row-label").textContent = `Service ${i + 1}`;
        row.querySelector(".remove-row")?.setAttribute("aria-label", `Remove service ${i + 1}`);
      });
    }

    function validateStep(idx) {
      if (idx === 0) {
        const name = form.centerName.value.trim();
        const slug = form.centerSlug.value.trim();
        const email = form.centerEmail.value.trim();
        let valid = true;
        ["centerName", "centerSlug", "centerEmail"].forEach((id) => {
          const field = $(`#${id}`).closest(".field");
          if (!form[id].value.trim()) {
            field.classList.add("has-error");
            valid = false;
          } else field.classList.remove("has-error");
        });
        if (!name || !slug || !email) return false;
        state.name = name;
        state.slug = slug;
        state.email = email;
        state.location = form.centerLocation.value.trim();
        state.tagline = form.centerTagline.value.trim();
        return valid;
      }
      if (idx === 1) {
        const cats = $$('input[name="categories"]:checked', form).map((i) => i.value);
        if (!cats.length) {
          $("#categoryError").hidden = false;
          return false;
        }
        $("#categoryError").hidden = true;
        state.categories = cats;
        state.services = collectServices();
        return true;
      }
      if (idx === 2) {
        state.contactName = form.contactName.value.trim();
        state.contactPhone = form.contactPhone.value.trim();
        return true;
      }
      return true;
    }

    function renderReview() {
      reviewPanel.innerHTML = `
        <div class="review-block">
          <h3>Center</h3>
          <dl>
            <div class="review-line"><dt>Name</dt><dd>${state.name || "N/A"}</dd></div>
            <div class="review-line"><dt>Slug</dt><dd>${state.slug || "N/A"}</dd></div>
            <div class="review-line"><dt>Email</dt><dd>${state.email || "N/A"}</dd></div>
            <div class="review-line"><dt>Location</dt><dd>${state.location || "N/A"}</dd></div>
            <div class="review-line"><dt>Tagline</dt><dd>${state.tagline || "N/A"}</dd></div>
          </dl>
        </div>
        <div class="review-block">
          <h3>Categories</h3>
          <p>${state.categories.length ? state.categories.map(catName).join(", ") : '<span class="review-empty">None selected</span>'}</p>
        </div>
        <div class="review-block">
          <h3>Services</h3>
          ${
            state.services.length
              ? state.services.map((s) => `<p><strong>${s.name}</strong> · ${s.duration || "N/A"}<br><span style="color:var(--color-ink-soft);font-size:0.88rem">${s.description || ""}</span></p>`).join("")
              : '<p class="review-empty">No services added</p>'
          }
        </div>
        <div class="review-block">
          <h3>Primary contact</h3>
          <dl>
            <div class="review-line"><dt>Name</dt><dd>${state.contactName || "N/A"}</dd></div>
            <div class="review-line"><dt>Phone</dt><dd>${state.contactPhone || "N/A"}</dd></div>
          </dl>
        </div>
      `;
    }

    form.addEventListener("click", (e) => {
      if (e.target.id === "nextStep") {
        if (!validateStep(currentStep)) return;
        currentStep = Math.min(currentStep + 1, steps.length - 1);
        if (currentStep === steps.length - 1) renderReview();
        updateStepNav();
      }
      if (e.target.id === "prevStep") {
        currentStep = Math.max(currentStep - 1, 0);
        updateStepNav();
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      renderReview();
      const ref = `APP-${Date.now().toString(36).toUpperCase()}`;
      form.hidden = true;
      stepNav.hidden = true;
      $("#onboardSuccess").hidden = false;
      $("#refCode").textContent = ref;
      $("#successPayload").textContent = JSON.stringify({ ...state, ref, submittedAt: new Date().toISOString() }, null, 2);
    });

    form.centerName?.addEventListener("input", () => {
      if (!form.centerSlug.dataset.touched) {
        form.centerSlug.value = form.centerName.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
    });
    form.centerSlug?.addEventListener("input", () => {
      form.centerSlug.dataset.touched = "1";
    });

    updateStepNav();
  }

  // ---------- motion ----------
  function observeReveals(root = document) {
    const els = $$(".reveal:not(.is-visible)", root);
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  function bootMotion() {
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));
    observeReveals();
  }

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    initHome();
    initDirectory();
    initCenterProfile();
    initOnboard();
    bootMotion();
  });
})();
