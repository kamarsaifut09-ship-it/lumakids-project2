const products = [
  { id: "LK-001", title: "Пижама «Лимонный день»", category: "Пижамы", ageRange: [2, 12], description: "Модель на фото: светлый комплект с принтом.", src: "./public/images/17861036598580539.jpg" },
  { id: "LK-002", title: "Пижама «Облака»", category: "Пижамы", ageRange: [2, 12], description: "Модель на фото: розовый комплект с принтом.", src: "./public/images/17872721088487035.jpg" },
  { id: "LK-003", title: "Пижама «Сладкий сон»", category: "Пижамы", ageRange: [2, 12], description: "Модель на фото: сиреневый комплект с принтом.", src: "./public/images/17860733421585008.jpg" },
  { id: "LK-004", title: "Спортивный комплект «Розовый»", category: "Спортивные комплекты", ageRange: [2, 12], description: "Модель на фото: светлый комплект с розовыми деталями.", src: "./public/images/17874270624581928.jpg" },
  { id: "LK-005", title: "Спортивный комплект «Зелёный»", category: "Спортивные комплекты", ageRange: [2, 12], description: "Модель на фото: зелёный комплект с контрастными деталями.", src: "./public/images/17870661123599568.jpg" },
  { id: "LK-006", title: "Повседневный комплект «Розовый»", category: "Повседневная одежда", ageRange: [2, 12], description: "Модель на фото: комплект с GAP-принтом.", src: "./public/images/17866543881527941.jpg" }
];

const savedSelection = JSON.parse(localStorage.getItem("lumaKidsSelection") || "[]");
const selected = new Set(savedSelection);
const grid = document.querySelector("#productGrid");
const featuredGrid = document.querySelector("#featuredGrid");
const selectedModels = document.querySelector("#selectedModels");
const result = document.querySelector("#formResult");
const dialog = document.querySelector("#productDialog");
const dialogContent = document.querySelector("#dialogContent");
const saveSelected = () => localStorage.setItem("lumaKidsSelection", JSON.stringify([...selected]));

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const ageLabel = product => `${product.ageRange[0]}–${product.ageRange[1]} лет`;

function productCard(product) {
  const isSelected = selected.has(product.id);
  return `<article class="product-card${isSelected ? " is-selected" : ""}" data-id="${product.id}">
    <button class="product-image product-open" type="button" aria-label="Подробнее: ${escapeHtml(product.title)}">
      <img src="${product.src}" alt="${escapeHtml(product.title)}" loading="lazy">
      <span class="product-number">${product.id}</span>
      <span class="selected-mark" aria-hidden="true">${isSelected ? "✓" : "+"}</span>
    </button>
    <div class="product-title"><span><b>${escapeHtml(product.title)}</b><small>${escapeHtml(product.category)} · ${ageLabel(product)}</small></span><button class="select-btn" type="button" data-select="${product.id}">${isSelected ? "Выбрано" : "Выбрать"}</button></div>
  </article>`;
}

function renderSelected() {
  if (!selectedModels) return;
  const items = products.filter(product => selected.has(product.id));
  selectedModels.innerHTML = items.length
    ? items.map(product => `<div class="selected-model"><span>${escapeHtml(product.title)} <small>${product.id}</small></span><button type="button" data-remove="${product.id}" aria-label="Убрать ${escapeHtml(product.title)}">×</button></div>`).join("")
    : "<p>Пока ничего не выбрано. Добавьте модели в каталоге.</p>";
  selectedModels.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    selected.delete(button.dataset.remove);
    saveSelected();
    renderCatalog();
    renderFeatured();
    renderSelected();
    renderSelectionBar();
  }));
}

function renderSelectionBar() {
  const count = document.querySelector("#selectionCount");
  if (count) count.textContent = selected.size ? `${selected.size} ${selected.size === 1 ? "модель выбрана" : "модели выбрано"}` : "Модели не выбраны";
}

function renderCatalog() {
  if (!grid) return;
  const query = (document.querySelector("#searchInput")?.value || "").trim().toLowerCase();
  const category = document.querySelector("#categoryFilter")?.value || "all";
  const age = document.querySelector("#ageFilter")?.value || "all";
  const filtered = products.filter(product => {
    const searchable = `${product.title} ${product.category} ${product.description}`.toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesCategory = category === "all" || product.category === category;
    const matchesAge = age === "all" || (age === "2-5" ? product.ageRange[0] <= 5 : age === "6-9" ? product.ageRange[1] >= 6 : product.ageRange[1] >= 10);
    return matchesSearch && matchesCategory && matchesAge;
  });
  grid.innerHTML = filtered.map(productCard).join("");
  document.querySelector("#emptyState").hidden = filtered.length > 0;
  document.querySelector("#catalogCount").textContent = `${filtered.length} ${filtered.length === 1 ? "модель" : "моделей"}`;
  grid.querySelectorAll("[data-select]").forEach(button => button.addEventListener("click", () => {
    selected.has(button.dataset.select) ? selected.delete(button.dataset.select) : selected.add(button.dataset.select);
    saveSelected();
    renderCatalog();
    renderSelected();
    renderSelectionBar();
  }));
  grid.querySelectorAll(".product-open").forEach(button => button.addEventListener("click", () => openProduct(button.closest("[data-id]").dataset.id)));
}

function renderFeatured() {
  if (!featuredGrid) return;
  featuredGrid.innerHTML = products.slice(0, 3).map(productCard).join("");
  featuredGrid.querySelectorAll("[data-select]").forEach(button => button.addEventListener("click", () => {
    selected.has(button.dataset.select) ? selected.delete(button.dataset.select) : selected.add(button.dataset.select);
    saveSelected();
    renderFeatured();
    renderSelected();
    renderSelectionBar();
  }));
  featuredGrid.querySelectorAll(".product-open").forEach(button => button.addEventListener("click", () => openProduct(button.closest("[data-id]").dataset.id)));
}

function openProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product || !dialog) return;
  const isSelected = selected.has(product.id);
  dialogContent.innerHTML = `<div class="dialog-product"><img src="${product.src}" alt="${escapeHtml(product.title)}"><div class="dialog-copy"><span class="eyebrow">${product.id} / ПРЕДВАРИТЕЛЬНЫЕ ДАННЫЕ</span><h2>${escapeHtml(product.title)}</h2><p>${escapeHtml(product.description)}</p><dl><div><dt>Категория</dt><dd>${escapeHtml(product.category)}</dd></div><div><dt>Возраст</dt><dd>${ageLabel(product)}</dd></div><div><dt>Размер, сезон, материал</dt><dd>Не указаны</dd></div></dl><button class="submit-btn dialog-select" type="button">${isSelected ? "Убрать из запроса" : "Выбрать модель"} <span>↗</span></button></div></div>`;
  dialogContent.querySelector(".dialog-select").addEventListener("click", () => {
    isSelected ? selected.delete(product.id) : selected.add(product.id);
    saveSelected();
    dialog.close();
    renderCatalog();
    renderFeatured();
    renderSelected();
    renderSelectionBar();
  });
  dialog.showModal();
}

document.querySelector("#categoryFilter")?.append(...[...new Set(products.map(product => product.category))].map(category => new Option(category, category)));
document.querySelector("#searchInput")?.addEventListener("input", renderCatalog);
document.querySelector("#categoryFilter")?.addEventListener("change", renderCatalog);
document.querySelector("#ageFilter")?.addEventListener("change", renderCatalog);
document.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
renderCatalog();
renderFeatured();
renderSelected();
renderSelectionBar();

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#nav");
menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}));
document.querySelector("#year").textContent = new Date().getFullYear();

(() => {
  const ticker = document.querySelector(".ticker");
  const track = ticker?.querySelector(".ticker-track");
  const firstGroup = track?.querySelector(".ticker-group");
  if (!ticker || !track || !firstGroup) return;

  const fillTicker = () => {
    track.querySelectorAll(".ticker-group[data-ticker-copy]").forEach(group => group.remove());
    const groupWidth = firstGroup.getBoundingClientRect().width;
    if (!groupWidth) return;
    while (track.scrollWidth < ticker.clientWidth + groupWidth) {
      const copy = firstGroup.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.dataset.tickerCopy = "true";
      track.append(copy);
    }
    track.style.setProperty("--ticker-shift", `-${groupWidth}px`);
  };

  fillTicker();
  window.addEventListener("resize", fillTicker, { passive: true });
  document.fonts?.ready.then(fillTicker);
})();

document.querySelector("#leadForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const chosen = products.filter(product => selected.has(product.id));
  const message = [
    "Запрос на модели — Luma Kids",
    `Имя: ${data.get("name")}`,
    `Контакт: ${data.get("contact")}`,
    `Модели: ${chosen.length ? chosen.map(product => `${product.id} — ${product.title}`).join(", ") : "не выбраны"}`,
    `Комментарий: ${data.get("message") || "не указан"}`
  ].join("\n");
  result.hidden = false;
  result.innerHTML = `<strong>Черновик сформирован, но не отправлен.</strong><br>Скопируйте текст и отправьте его вручную.<p><button type="button" class="copy-request">Скопировать текст</button> <a href="https://t.me/lumakids_uz" target="_blank" rel="noopener">Открыть Telegram ↗</a></p>`;
  result.querySelector(".copy-request").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(message); } catch { const area = document.createElement("textarea"); area.value = message; result.append(area); area.select(); document.execCommand("copy"); area.remove(); }
    result.querySelector(".copy-request").textContent = "Скопировано";
  });
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

(() => {
  const progress = document.querySelector(".scroll-progress");
  const updateProgress = () => { const max = document.documentElement.scrollHeight - window.innerHeight; if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`; };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  const revealTargets = document.querySelectorAll(".collection-heading, .product-card, .studio-copy, .studio-image, .wholesale-intro, .lead-form");
  revealTargets.forEach((element, index) => { element.classList.add("reveal"); if (element.classList.contains("product-card")) element.style.transitionDelay = `${(index % 3) * 90}ms`; });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .12, rootMargin: "0px 0px -35px 0px" });
    revealTargets.forEach(element => observer.observe(element));
  } else revealTargets.forEach(element => element.classList.add("is-visible"));
})();
(() => {
  const header = document.querySelector(".masthead");
  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
})();
