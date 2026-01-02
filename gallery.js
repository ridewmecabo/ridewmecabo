/* ================== Gallery: tabs + reveal + lightbox ================== */
(function () {
  const tabs = document.querySelectorAll(".gallery-tab");
  const items = document.querySelectorAll(".gallery-item");
  const grid = document.getElementById("galleryGrid");

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  items.forEach((it) => io.observe(it));

  // Tabs filter
  function applyFilter(cat) {
    items.forEach((it) => {
      const itemCat = it.getAttribute("data-cat");
      const show = (cat === "all" || itemCat === cat);
      it.classList.toggle("is-hidden", !show);
    });
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    });
  });

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxCaption = document.getElementById("lightboxCaption");

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || "";
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.style.overflow = "auto";
  }

  grid?.addEventListener("click", (e) => {
    const fig = e.target.closest(".gallery-item");
    if (!fig) return;
    const img = fig.querySelector("img");
    const title = fig.querySelector("h4")?.textContent || "Ride W Me Cabo";
    openLightbox(img.src, title);
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // Default
  applyFilter("all");
})();
