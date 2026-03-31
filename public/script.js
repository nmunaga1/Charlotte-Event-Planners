const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsHover =
  window.matchMedia("(hover: hover)").matches &&
  window.matchMedia("(pointer: fine)").matches;

const siteState = {
  content: null,
  consultationSuccessMessage: "Thank you! Your inquiry has been sent.",
};

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a[href^='#']");
const heroSection = document.querySelector(".hero");
const year = document.getElementById("year");
const consultationForm = document.querySelector(".contact-form[name='consultation']");

if (year) {
  year.textContent = new Date().getFullYear();
}

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const sanitizeUrl = (value, fallback = "#") => {
  const nextValue = String(value ?? "").trim();

  if (!nextValue) {
    return fallback;
  }

  if (
    nextValue.startsWith("#") ||
    nextValue.startsWith("/") ||
    nextValue.startsWith("./") ||
    nextValue.startsWith("mailto:") ||
    nextValue.startsWith("tel:")
  ) {
    return nextValue;
  }

  try {
    const parsedUrl = new URL(nextValue, window.location.origin);

    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.toString();
    }
  } catch (_error) {
    return fallback;
  }

  return fallback;
};

const sanitizeImageUrl = (value, fallback = "") => {
  const nextValue = String(value ?? "").trim();

  if (!nextValue) {
    return fallback;
  }

  try {
    const parsedUrl = new URL(nextValue, window.location.origin);

    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.toString();
    }
  } catch (_error) {
    if (nextValue.startsWith("/")) {
      return nextValue;
    }
  }

  return fallback;
};

const setTextContent = (target, value) => {
  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!element || value === undefined || value === null) {
    return;
  }

  element.textContent = String(value);
};

const setMultipleTextContent = (selector, value) => {
  document.querySelectorAll(selector).forEach((element) => {
    setTextContent(element, value);
  });
};

const setAttributeValue = (target, attributeName, value) => {
  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!element || value === undefined || value === null) {
    return;
  }

  element.setAttribute(attributeName, String(value));
};

const setSafeLink = (target, value, fallback = "#") => {
  setAttributeValue(target, "href", sanitizeUrl(value, fallback));
};

const closeMenu = () => {
  if (!navMenu || !navToggle) return;

  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
};

const toggleMenu = () => {
  if (!navMenu || !navToggle) return;

  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", toggleMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!navMenu.classList.contains("is-open")) return;
    if (navMenu.contains(target) || navToggle.contains(target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      closeMenu();
    }
  });
}

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const revealObserver = prefersReducedMotion
  ? null
  : new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

const counterObserver = prefersReducedMotion
  ? null
  : new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateValue(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.8 }
    );

const animateValue = (element) => {
  const target = Number(element.dataset.count || "0");
  const duration = 1400;
  const startTime = performance.now();

  const updateCount = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  };

  requestAnimationFrame(updateCount);
};

const registerRevealItems = (root = document) => {
  const revealItems = root.querySelectorAll(".reveal");

  revealItems.forEach((item, index) => {
    if (!(item instanceof HTMLElement) || item.dataset.revealBound === "true") {
      return;
    }

    item.dataset.revealBound = "true";
    item.style.setProperty("--reveal-delay", `${Math.min(index * 60, 320)}ms`);

    if (!revealObserver) {
      item.classList.add("is-visible");
      return;
    }

    revealObserver.observe(item);
  });
};

const registerCountItems = (root = document) => {
  const countItems = root.querySelectorAll("[data-count]");

  countItems.forEach((item) => {
    if (!(item instanceof HTMLElement) || item.dataset.countBound === "true") {
      return;
    }

    item.dataset.countBound = "true";

    if (!counterObserver) {
      item.textContent = item.dataset.count || "0";
      return;
    }

    counterObserver.observe(item);
  });
};

const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`[data-nav="${entry.target.id}"]`);
      if (!link || !entry.isIntersecting) return;

      document
        .querySelectorAll(".nav-menu a[data-nav]")
        .forEach((item) => item.classList.remove("active"));

      link.classList.add("active");
    });
  },
  {
    rootMargin: "-40% 0px -45% 0px",
    threshold: 0.02,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const setConsultationMessage = (element, message, isError = false) => {
  if (!(element instanceof HTMLElement)) return;

  element.textContent = message;
  element.classList.remove("hidden");
  element.dataset.state = isError ? "error" : "success";
  element.setAttribute("role", isError ? "alert" : "status");
  element.setAttribute("aria-live", isError ? "assertive" : "polite");
};

const renderHeroHighlights = (items = []) => {
  const container = document.querySelector(".hero-highlights");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) =>
        `<span class="reveal" data-tilt="chip">${escapeHtml(String(item))}</span>`
    )
    .join("");
};

const renderHeroChecklist = (items = []) => {
  const container = document.querySelector(".hero-list");
  if (!container) return;

  container.innerHTML = items
    .map((item) => `<li>${escapeHtml(String(item))}</li>`)
    .join("");
};

const renderProofStats = (items = []) => {
  const container = document.querySelector(".proof-stats");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <article class="stat-card reveal" data-tilt="card" style="--reveal-delay:${Math.min(
          index * 70,
          280
        )}ms;">
          <strong>
            <span data-count="${escapeHtml(String(item.value || "0"))}">0</span><span>${escapeHtml(
              String(item.suffix || "")
            )}</span>
          </strong>
          <span>${escapeHtml(String(item.label || ""))}</span>
        </article>
      `
    )
    .join("");
};

const renderServices = (items = []) => {
  const container = document.querySelector(".services-grid");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <article class="service-card reveal" data-tilt="card" style="--reveal-delay:${Math.min(
          index * 70,
          320
        )}ms;">
          <img
            src="${escapeHtml(sanitizeImageUrl(item.image))}"
            alt="${escapeHtml(String(item.alt || item.title || "Service image"))}"
            loading="lazy"
          />
          <div class="service-card-content">
            <h3>${escapeHtml(String(item.title || ""))}</h3>
            <p>${escapeHtml(String(item.description || ""))}</p>
          </div>
        </article>
      `
    )
    .join("");
};

const renderPortfolio = (items = []) => {
  const container = document.querySelector(".portfolio-grid");
  if (!container) return;

  const allowedLayouts = new Set(["featured", "tall", "wide", "standard"]);

  container.innerHTML = items
    .map((item, index) => {
      const layout = allowedLayouts.has(item.layout) ? item.layout : "standard";
      const layoutClass = layout === "standard" ? "" : ` ${layout}`;

      return `
        <figure class="portfolio-card reveal${layoutClass}" data-tilt="card" style="--reveal-delay:${Math.min(
          index * 60,
          320
        )}ms;">
          <img
            src="${escapeHtml(sanitizeImageUrl(item.image))}"
            alt="${escapeHtml(String(item.alt || item.title || "Portfolio image"))}"
            loading="lazy"
          />
          <figcaption>
            <span>${escapeHtml(String(item.label || ""))}</span>
            <strong>${escapeHtml(String(item.title || ""))}</strong>
          </figcaption>
        </figure>
      `;
    })
    .join("");
};

const renderAboutParagraphs = (items = []) => {
  const container = document.querySelector("[data-about-paragraphs]");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) =>
        `<p class="reveal" style="--reveal-delay:${Math.min(index * 70, 140)}ms;">${escapeHtml(
          String(item)
        )}</p>`
    )
    .join("");
};

const renderAboutPoints = (items = []) => {
  const container = document.querySelector(".about-points");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <div class="reveal" style="--reveal-delay:${Math.min(index * 70, 220)}ms;">
          <strong>${escapeHtml(String(item.title || ""))}</strong>
          <span>${escapeHtml(String(item.description || ""))}</span>
        </div>
      `
    )
    .join("");
};

const renderBenefits = (items = []) => {
  const container = document.querySelector(".benefits-grid");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <article class="benefit-card reveal" data-tilt="card" style="--reveal-delay:${Math.min(
          index * 60,
          260
        )}ms;">
          <span class="benefit-number">${escapeHtml(String(item.number || ""))}</span>
          <h3>${escapeHtml(String(item.title || ""))}</h3>
          <p>${escapeHtml(String(item.description || ""))}</p>
        </article>
      `
    )
    .join("");
};

const renderTestimonials = (items = []) => {
  const container = document.querySelector(".testimonials-grid");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <article class="testimonial-card reveal" data-tilt="card" style="--reveal-delay:${Math.min(
          index * 60,
          260
        )}ms;">
          <p>"${escapeHtml(String(item.quote || ""))}"</p>
          <div>
            <strong>${escapeHtml(String(item.name || ""))}</strong>
            <span>${escapeHtml(String(item.subtitle || ""))}</span>
          </div>
        </article>
      `
    )
    .join("");
};

const renderProcess = (items = []) => {
  const container = document.querySelector(".process-grid");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <article class="process-card reveal" data-tilt="card" style="--reveal-delay:${Math.min(
          index * 70,
          210
        )}ms;">
          <span>${escapeHtml(String(item.number || ""))}</span>
          <h3>${escapeHtml(String(item.title || ""))}</h3>
          <p>${escapeHtml(String(item.description || ""))}</p>
        </article>
      `
    )
    .join("");
};

const renderContactOptions = (items = [], placeholderText = "Select your event type") => {
  const select = consultationForm?.querySelector('select[name="event-type"]');
  if (!(select instanceof HTMLSelectElement)) return;

  select.innerHTML = [
    `<option value="" selected disabled>${escapeHtml(placeholderText)}</option>`,
    ...items.map((item) => `<option>${escapeHtml(String(item))}</option>`),
  ].join("");
};

const updateStructuredData = (content) => {
  const structuredDataElement = document.getElementById("structured-data");
  if (!(structuredDataElement instanceof HTMLScriptElement)) return;

  const seo = content.seo || {};
  const brand = content.brand || {};
  const contact = content.contact || {};
  const social = content.social || {};
  const siteUrl = sanitizeUrl(seo.siteUrl, window.location.origin);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${brand.mark || "Charlotte"} ${brand.name || "Event Planners"}`.trim(),
    url: siteUrl,
    description: seo.description || "",
    telephone: contact.phone || "",
    email: contact.email || "",
    image: seo.ogImage || "",
    areaServed: contact.location || "Charlotte, North Carolina",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Charlotte",
      addressRegion: "NC",
      addressCountry: "US",
    },
    sameAs: [social.instagram, social.facebook].filter(Boolean),
  };

  structuredDataElement.textContent = JSON.stringify(structuredData, null, 2);
};

const applySeoContent = (content) => {
  const seo = content.seo || {};
  const brand = content.brand || {};
  const siteUrl = sanitizeUrl(seo.siteUrl, window.location.origin);

  if (seo.title) {
    document.title = seo.title;
  }

  const seoTargets = [
    ['[data-seo="description"]', seo.description],
    ['[data-seo="keywords"]', seo.keywords],
    ['[data-seo="og:title"]', seo.title],
    ['[data-seo="og:description"]', seo.description],
    ['[data-seo="og:image"]', seo.ogImage],
    ['[data-seo="og:url"]', siteUrl],
    ['[data-seo="twitter:title"]', seo.title],
    ['[data-seo="twitter:description"]', seo.description],
    ['[data-seo="twitter:image"]', seo.ogImage],
  ];

  seoTargets.forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLMetaElement) || !value) return;
    element.content = String(value);
  });

  const canonicalLink = document.querySelector('[data-seo="canonical"]');
  if (canonicalLink instanceof HTMLLinkElement) {
    canonicalLink.href = siteUrl;
  }

  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  if (ogSiteName instanceof HTMLMetaElement) {
    ogSiteName.content = `${brand.mark || "Charlotte"} ${brand.name || "Event Planners"}`.trim();
  }

  updateStructuredData(content);
};

const applySiteContent = (content) => {
  siteState.content = content;
  applySeoContent(content);

  const brandName = content.brand || {};
  const hero = content.hero || {};
  const proof = content.proof || {};
  const services = content.services || {};
  const portfolio = content.portfolio || {};
  const about = content.about || {};
  const benefits = content.benefits || {};
  const testimonials = content.testimonials || {};
  const process = content.process || {};
  const ctaBanner = content.ctaBanner || {};
  const contact = content.contact || {};
  const contactFormContent = contact.form || {};
  const social = content.social || {};

  setMultipleTextContent(".brand-mark", brandName.mark);
  setMultipleTextContent(".brand-name", brandName.name);
  setTextContent(".footer-description", brandName.footerDescription);

  setTextContent(".hero-copy .eyebrow", hero.eyebrow);
  setTextContent(".hero-copy h1", hero.title);
  setTextContent(".hero-text", hero.text);
  setTextContent(".hero-actions .btn", hero.primaryCtaLabel);
  setTextContent(".hero-actions .btn-secondary", hero.secondaryCtaLabel);
  setTextContent(".hero-card-label", hero.bookingLabel);
  setTextContent(".hero-card h2", hero.cardTitle);
  renderHeroChecklist(Array.isArray(hero.cardList) ? hero.cardList : []);
  renderHeroHighlights(Array.isArray(hero.highlights) ? hero.highlights : []);

  if (hero.backgroundImage) {
    document.documentElement.style.setProperty(
      "--hero-image",
      `url("${sanitizeImageUrl(hero.backgroundImage)}")`
    );
  }

  setTextContent(".proof-copy .eyebrow", proof.eyebrow);
  setTextContent(".proof-copy h2", proof.title);
  renderProofStats(Array.isArray(proof.stats) ? proof.stats : []);

  setTextContent(".services .section-head .eyebrow", services.eyebrow);
  setTextContent(".services .section-head h2", services.title);
  setTextContent(".services .section-head .btn", services.ctaLabel);
  renderServices(Array.isArray(services.items) ? services.items : []);

  setTextContent(".portfolio .section-head .eyebrow", portfolio.eyebrow);
  setTextContent(".portfolio .section-head h2", portfolio.title);
  setTextContent(".portfolio .section-head .btn", portfolio.ctaLabel);
  renderPortfolio(Array.isArray(portfolio.items) ? portfolio.items : []);

  setTextContent(".about-copy .eyebrow", about.eyebrow);
  setTextContent(".about-copy h2", about.title);
  renderAboutParagraphs(Array.isArray(about.paragraphs) ? about.paragraphs : []);
  renderAboutPoints(Array.isArray(about.points) ? about.points : []);
  setTextContent(".about-badge span", about.badgeEyebrow);
  setTextContent(".about-badge strong", about.badgeTitle);
  setTextContent(".about-copy .btn", about.ctaLabel);
  setAttributeValue(".about-main-image", "src", sanitizeImageUrl(about.image));
  setAttributeValue(
    ".about-main-image",
    "alt",
    about.alt || "Luxury event planner styling a tablescape"
  );

  setTextContent(".why-choose-us .section-head .eyebrow", benefits.eyebrow);
  setTextContent(".why-choose-us .section-head h2", benefits.title);
  renderBenefits(Array.isArray(benefits.items) ? benefits.items : []);

  setTextContent(".testimonials .section-head .eyebrow", testimonials.eyebrow);
  setTextContent(".testimonials .section-head h2", testimonials.title);
  setTextContent(".testimonials .section-head .btn", testimonials.ctaLabel);
  renderTestimonials(Array.isArray(testimonials.items) ? testimonials.items : []);

  setTextContent(".process .section-head .eyebrow", process.eyebrow);
  setTextContent(".process .section-head h2", process.title);
  renderProcess(Array.isArray(process.items) ? process.items : []);

  setTextContent(".cta-banner-inner .eyebrow", ctaBanner.eyebrow);
  setTextContent(".cta-banner-inner h2", ctaBanner.title);
  setTextContent(".cta-banner-inner p:not(.eyebrow)", ctaBanner.text);
  setTextContent(".cta-banner-inner .btn", ctaBanner.ctaLabel);

  if (ctaBanner.backgroundImage) {
    document.documentElement.style.setProperty(
      "--cta-image",
      `url("${sanitizeImageUrl(ctaBanner.backgroundImage)}")`
    );
  }

  setTextContent(".contact-copy .eyebrow", contact.eyebrow);
  setTextContent(".contact-copy h2", contact.title);
  setTextContent(".contact-copy > p:not(.eyebrow)", contact.text);
  setTextContent(".contact-details a[href^='tel:']", contact.phoneLabel || contact.phone);
  setAttributeValue(
    ".contact-details a[href^='tel:']",
    "href",
    `tel:${String(contact.phone || "").replaceAll(/\s+/g, "")}`
  );
  setTextContent(".contact-details a[href^='mailto:']", contact.emailLabel || contact.email);
  setAttributeValue(
    ".contact-details a[href^='mailto:']",
    "href",
    `mailto:${String(contact.email || "").trim()}`
  );
  setTextContent(".contact-details p", contact.location);

  const mapFrame = document.querySelector(".map-frame iframe");
  if (mapFrame instanceof HTMLIFrameElement && contact.mapQuery) {
    mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(
      contact.mapQuery
    )}&z=12&output=embed`;
    mapFrame.title = `Map of ${contact.mapQuery}`;
  }

  setTextContent('[data-form-label="name"]', contactFormContent.nameLabel);
  setTextContent('[data-form-label="email"]', contactFormContent.emailLabel);
  setTextContent(
    '[data-form-label="event-type"]',
    contactFormContent.eventTypeLabel
  );
  setTextContent('[data-form-label="message"]', contactFormContent.messageLabel);
  setAttributeValue(
    consultationForm?.querySelector('input[name="name"]'),
    "placeholder",
    contactFormContent.namePlaceholder
  );
  setAttributeValue(
    consultationForm?.querySelector('input[name="email"]'),
    "placeholder",
    contactFormContent.emailPlaceholder
  );
  setAttributeValue(
    consultationForm?.querySelector('textarea[name="message"]'),
    "placeholder",
    contactFormContent.messagePlaceholder
  );
  setTextContent(
    consultationForm?.querySelector('button[type="submit"]'),
    contactFormContent.submitLabel
  );
  renderContactOptions(
    Array.isArray(contact.eventOptions) ? contact.eventOptions : [],
    contactFormContent.eventTypePlaceholder
  );

  siteState.consultationSuccessMessage =
    contactFormContent.successMessage || siteState.consultationSuccessMessage;

  setSafeLink(".social-instagram", social.instagram, "#");
  setSafeLink(".social-facebook", social.facebook, "#");

  registerRevealItems();
  registerCountItems();
  registerInteractiveSurfaces();
};

const loadSiteContent = async () => {
  try {
    const response = await fetch("/api/content", {
      headers: {
        Accept: "application/json",
      },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.content) {
      throw new Error(payload?.error || "Unable to load site content.");
    }

    applySiteContent(payload.content);
  } catch (error) {
    console.error("Failed to apply CMS content:", error);
  }
};

const registerInteractiveSurfaces = (root = document) => {
  if (!supportsHover || prefersReducedMotion) {
    return;
  }

  root.querySelectorAll("[data-tilt]").forEach((element) => {
    if (!(element instanceof HTMLElement) || element.dataset.tiltBound === "true") {
      return;
    }

    element.dataset.tiltBound = "true";

    const reset = () => {
      element.style.setProperty("--tilt-rotate-x", "0deg");
      element.style.setProperty("--tilt-rotate-y", "0deg");
      element.style.setProperty("--tilt-pointer-x", "50%");
      element.style.setProperty("--tilt-pointer-y", "50%");
      element.classList.remove("is-tilting");
    };

    element.addEventListener("pointerenter", () => {
      element.classList.add("is-tilting");
    });

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotateX = (0.5 - y) * 6;
      const rotateY = (x - 0.5) * 8;

      element.style.setProperty("--tilt-rotate-x", `${rotateX.toFixed(2)}deg`);
      element.style.setProperty("--tilt-rotate-y", `${rotateY.toFixed(2)}deg`);
      element.style.setProperty("--tilt-pointer-x", `${(x * 100).toFixed(1)}%`);
      element.style.setProperty("--tilt-pointer-y", `${(y * 100).toFixed(1)}%`);
    });

    element.addEventListener("pointerleave", reset);
    element.addEventListener("pointercancel", reset);
  });
};

const registerHeroParallax = () => {
  if (!heroSection || !supportsHover || prefersReducedMotion) {
    return;
  }

  heroSection.addEventListener("pointermove", (event) => {
    const bounds = heroSection.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    heroSection.style.setProperty("--hero-shift-x", `${(x * 26).toFixed(2)}px`);
    heroSection.style.setProperty("--hero-shift-y", `${(y * 20).toFixed(2)}px`);
    heroSection.style.setProperty("--hero-glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    heroSection.style.setProperty("--hero-glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  });

  heroSection.addEventListener("pointerleave", () => {
    heroSection.style.setProperty("--hero-shift-x", "0px");
    heroSection.style.setProperty("--hero-shift-y", "0px");
    heroSection.style.setProperty("--hero-glow-x", "78%");
    heroSection.style.setProperty("--hero-glow-y", "24%");
  });
};

if (consultationForm instanceof HTMLFormElement) {
  const consultationFormMessage = consultationForm.querySelector("[data-form-message]");
  const consultationSubmitButton = consultationForm.querySelector('button[type="submit"]');

  consultationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const defaultSubmitText =
      consultationSubmitButton instanceof HTMLButtonElement
        ? consultationSubmitButton.textContent
        : "Send Inquiry";

    if (consultationFormMessage instanceof HTMLElement) {
      consultationFormMessage.textContent = "";
      consultationFormMessage.classList.add("hidden");
      delete consultationFormMessage.dataset.state;
    }

    consultationForm.setAttribute("aria-busy", "true");

    if (consultationSubmitButton instanceof HTMLButtonElement) {
      consultationSubmitButton.disabled = true;
      consultationSubmitButton.textContent = "Sending...";
    }

    try {
      const formData = new FormData(consultationForm);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.error || `Submission failed with status ${response.status}`
        );
      }

      consultationForm.reset();
      setConsultationMessage(
        consultationFormMessage,
        siteState.consultationSuccessMessage
      );
    } catch (error) {
      setConsultationMessage(
        consultationFormMessage,
        error instanceof Error
          ? error.message
          : "Sorry, your inquiry could not be sent. Please try again.",
        true
      );
    } finally {
      consultationForm.setAttribute("aria-busy", "false");

      if (consultationSubmitButton instanceof HTMLButtonElement) {
        consultationSubmitButton.disabled = false;
        consultationSubmitButton.textContent = defaultSubmitText || "Send Inquiry";
      }
    }
  });
}

const initializeSite = async () => {
  registerRevealItems();
  registerCountItems();
  registerInteractiveSurfaces();
  registerHeroParallax();
  await loadSiteContent();

  window.requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });
};

initializeSite();
