const products = [
  { src: "./public/images/17860733421585008.jpg", title: "Комплекты", tag: "01" },
  { src: "./public/images/17861036598580539.jpg", title: "Повседневная одежда", tag: "02" },
  { src: "./public/images/17866543881527941.jpg", title: "Детские модели", tag: "03" },
  { src: "./public/images/17870661123599568.jpg", title: "Коллекция", tag: "04" },
  { src: "./public/images/17872721088487035.jpg", title: "Мягкий трикотаж", tag: "05" },
  { src: "./public/images/17874270624581928.jpg", title: "Новые модели", tag: "06" }
];
const grid = document.querySelector('#productGrid');
if (grid) {
  grid.innerHTML = products.map((item, index) => `
    <article class="product-card">
      <div class="product-image"><img src="${item.src}" alt="${item.title}" loading="lazy"><span class="product-number">${item.tag}</span></div>
      <div class="product-title">${item.title}<span>↗</span></div>
    </article>`).join('');
}
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));
document.querySelector('#year').textContent = new Date().getFullYear();

const form = document.querySelector('#leadForm');
const result = document.querySelector('#formResult');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const d = new FormData(form);
  const message = [
    'Заявка на оптовое сотрудничество — Luma Kids',
    `Имя / компания: ${d.get('name')}`,
    `Контакт: ${d.get('contact')}`,
    `Тип бизнеса: ${d.get('business')}`,
    `Объём: ${d.get('volume') || 'Не указан'}`,
    `Комментарий: ${d.get('message') || 'Не указан'}`
  ].join('\n');
  result.hidden = false;
  result.innerHTML = `<strong>Заявка сформирована.</strong><br>Скопируйте текст и отправьте его в Telegram Luma Kids.<p><button type="button" class="copy-request">Скопировать заявку</button> <a href="https://t.me/lumakids_uz" target="_blank" rel="noopener">Открыть Telegram ↗</a></p>`;
  result.querySelector('.copy-request').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message);
      result.querySelector('.copy-request').textContent = 'Скопировано';
    } catch {
      const area = document.createElement('textarea');
      area.value = message; result.append(area); area.select(); document.execCommand('copy'); area.remove();
      result.querySelector('.copy-request').textContent = 'Скопировано';
    }
  });
  result.scrollIntoView({behavior:'smooth', block:'nearest'});
});


// Motion system: reveal-on-scroll, reading progress and gentle pointer response.
(() => {
  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  const revealTargets = document.querySelectorAll(
    '.collection-heading, .product-card, .studio-copy, .studio-image, .wholesale-intro, .lead-form, .section-top'
  );
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.classList.contains('product-card')) el.style.transitionDelay = `${(i % 3) * 90}ms`;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // A subtle pointer-follow on the hero stamp, disabled for touch devices.
  const stamp = document.querySelector('.blue-stamp');
  const visual = document.querySelector('.hero-visual');
  if (stamp && visual && window.matchMedia('(pointer:fine)').matches) {
    visual.addEventListener('pointermove', event => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      stamp.style.translate = `${x * 10}px ${y * 10}px`;
    });
    visual.addEventListener('pointerleave', () => { stamp.style.translate = '0 0'; });
  }
})();


// Header compacts slightly after scrolling while staying fixed.
(() => {
  const header = document.querySelector('.masthead');
  if (!header) return;
  const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
})();
