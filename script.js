/* =========================================================
   Verse — vanilla JS interactions
   Data, rendering, filtering, search, modal, theme, motion
   ========================================================= */

// ---------- Book data (content adapted from the reference store) ----------
const BOOKS = [
  { id: 1, title: "The Silent Horizon", author: "Rial Loz", cat: "Fiction", cover: "./images/book-1.png",
    desc: "A slow-burning story about a coastal town that wakes up to find the sea has moved.",
    pages: 328, lang: "English", format: "EPUB · PDF", price: "$11.99", old: "$19.99" },
  { id: 2, title: "Paper Lanterns", author: "Mira Halden", cat: "Fiction", cover: "./images/book-2.png",
    desc: "Three generations, one letter, and a summer that refuses to end quietly.", pages: 254,
    lang: "English", format: "EPUB · PDF", price: "$11.99", old: "$19.99" },
  { id: 3, title: "The Quiet Case", author: "Dorian Vale", cat: "Mystery", cover: "./images/book-3.png",
    desc: "A detective with nothing left to prove takes the one case nobody wants to close.",
    pages: 392, lang: "English", format: "EPUB · MOBI", price: "$11.99", old: "$19.99" },
  { id: 4, title: "Signals & Noise", author: "Ada Reyes", cat: "Business", cover: "./images/book-4.png",
    desc: "How the best teams cut through distraction and ship work that actually matters.",
    pages: 276, lang: "English", format: "EPUB · PDF", price: "$11.99", old: "$19.99" },
  { id: 5, title: "Orbital Bloom", author: "Kenji Sato", cat: "Sci-Fi", cover: "./images/book-5.png",
    desc: "A botanist aboard a dying station grows the first flower humanity has seen in decades.",
    pages: 344, lang: "English", format: "EPUB · PDF", price: "$11.99", old: "$19.99" },
  { id: 6, title: "Small Hours", author: "Nora Bell", cat: "Poetry", cover: "./images/book-6.png",
    desc: "Sixty short poems written between 3am and sunrise, about cities and staying awake.",
    pages: 132, lang: "English", format: "EPUB", price: "$7.99", old: "$14.99" },
  { id: 7, title: "The Long Ledger", author: "Rial Loz", cat: "History", cover: "./images/book-7.png",
    desc: "Four centuries of trade, told through the account books of a single family.",
    pages: 460, lang: "English", format: "EPUB · PDF", price: "$11.99", old: "$19.99" },
  { id: 8, title: "Rewrite Yourself", author: "Elif Karam", cat: "Self-Help", cover: "./images/book-8.png",
    desc: "A practical, unsentimental guide to changing habits without changing who you are.",
    pages: 208, lang: "English", format: "EPUB · PDF", price: "$7.99", old: "$14.99" },
  { id: 9, title: "Glass Cathedral", author: "Dorian Vale", cat: "Mystery", cover: "./images/book-9.png",
    desc: "An architect disappears the night her building opens. Only the blueprints know why.",
    pages: 366, lang: "English", format: "EPUB · MOBI", price: "$7.99", old: "$14.99" },
  { id: 10, title: "After the Machines", author: "Ada Reyes", cat: "Sci-Fi", cover: "./images/book-10.png",
    desc: "A hopeful look at the first generation to grow up beside genuinely thinking systems.",
    pages: 298, lang: "English", format: "EPUB · PDF", price: "$7.99", old: "$14.99" },
];

const CATEGORIES = [
  { name: "Fiction", icon: "✒", blurb: "Stories that stay with you" },
  { name: "Mystery", icon: "☾", blurb: "Cases worth losing sleep over" },
  { name: "Sci-Fi", icon: "✧", blurb: "Futures close enough to touch" },
  { name: "Business", icon: "◧", blurb: "Work, focus and strategy" },
  { name: "Poetry", icon: "❦", blurb: "Short forms, long echoes" },
  { name: "Self-Help", icon: "◉", blurb: "Practical, honest guidance" },
  { name: "History", icon: "⌛", blurb: "The long view of things" },
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let activeCat = "All";
let query = "";

// ---------- Preloader ----------
window.addEventListener("load", () => {
  setTimeout(() => $("#preloader").classList.add("is-done"), 450);
});

// ---------- Theme toggle (persisted) ----------
const storedTheme = localStorage.getItem("verse-theme");
if (storedTheme) document.documentElement.dataset.theme = storedTheme;
$("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("verse-theme", next);
});

// ---------- Mobile navigation ----------
const nav = $("#nav");
const burger = $("#burger");
const toggleNav = (open) => {
  nav.classList.toggle("is-open", open);
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("is-locked", open);
};
burger.addEventListener("click", () => toggleNav(!nav.classList.contains("is-open")));
$$(".nav__link").forEach((l) => l.addEventListener("click", () => toggleNav(false)));

// ---------- Render books ----------
function bookCard(b, i) {
  return `
    <article class="card" style="animation-delay:${i * 60}ms">
      <div class="card__art">
        <span class="tag">${b.cat}</span>
        <img src="${b.cover}" alt="Cover of ${b.title} by ${b.author}" loading="lazy" />
      </div>
      <h3>${b.title}</h3>
      <p class="card__author">by ${b.author}</p>
      <p class="card__desc">${b.desc}</p>
      <div class="card__foot">
        <span class="card__price">${b.price}<s>${b.old}</s></span>
        <button class="btn btn--sm btn--primary" data-book="${b.id}">View Book</button>
      </div>
    </article>`;
}

function renderBooks() {
  const q = query.trim().toLowerCase();
  const list = BOOKS.filter(
    (b) =>
      (activeCat === "All" || b.cat === activeCat) &&
      (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
  );
  $("#booksGrid").innerHTML = list.map(bookCard).join("");
  $("#emptyState").hidden = list.length > 0;
}

// ---------- Filters, categories, footer links ----------
function renderChrome() {
  const cats = ["All", ...CATEGORIES.map((c) => c.name)];
  $("#filters").innerHTML = cats
    .map((c) => `<button class="chip${c === activeCat ? " is-active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");

  $("#cats").innerHTML = CATEGORIES.map(
    (c, i) => `
      <button class="cat reveal" data-delay="${i % 4}" data-cat-jump="${c.name}">
        <span class="cat__icon" aria-hidden="true">${c.icon}</span>
        <h3>${c.name}</h3>
        <p>${c.blurb}</p>
        <p class="tag" style="margin-top:.9rem">${BOOKS.filter((b) => b.cat === c.name).length} books</p>
      </button>`
  ).join("");

  $("#footerCats").innerHTML = CATEGORIES.slice(0, 5)
    .map((c) => `<li><a href="#books" data-cat-jump="${c.name}">${c.name}</a></li>`)
    .join("");
}

// Delegated clicks: filter chips, category jumps, view-book buttons
document.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-cat]");
  if (chip) {
    activeCat = chip.dataset.cat;
    $$("#filters .chip").forEach((c) => c.classList.toggle("is-active", c.dataset.cat === activeCat));
    renderBooks();
    return;
  }

  const jump = e.target.closest("[data-cat-jump]");
  if (jump) {
    activeCat = jump.dataset.catJump;
    renderChrome();
    renderBooks();
    observeReveals();
    $("#books").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const view = e.target.closest("[data-book]");
  if (view) openModal(Number(view.dataset.book));
});

// ---------- Search ----------
$("#search").addEventListener("input", (e) => {
  query = e.target.value;
  renderBooks();
});

// ---------- Modal ----------
const modal = $("#modal");
let lastFocused = null;

function openModal(id) {
  const b = BOOKS.find((x) => x.id === id);
  if (!b) return;
  lastFocused = document.activeElement;
  $("#modalImg").src = b.cover;
  $("#modalImg").alt = `Cover of ${b.title}`;
  $("#modalCat").textContent = b.cat;
  $("#modalTitle").textContent = b.title;
  $("#modalAuthor").textContent = `by ${b.author}`;
  $("#modalDesc").textContent = b.desc;
  $("#modalMeta").innerHTML = `
    <li><strong>Pages:</strong> ${b.pages}</li>
    <li><strong>Language:</strong> ${b.lang}</li>
    <li><strong>Format:</strong> ${b.format}</li>
    <li><strong>Delivery:</strong> Instant download · free shipping on orders over $100</li>`;
  $("#modalPrice").textContent = b.price;
  $("#modalOld").textContent = b.old;
  modal.hidden = false;
  document.body.classList.add("is-locked");
  $(".modal__close").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("is-locked");
  if (lastFocused) lastFocused.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!modal.hidden) closeModal();
    if (nav.classList.contains("is-open")) toggleNav(false);
  }
});

// ---------- Newsletter validation ----------
$("#newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#email");
  const msg = $("#newsMsg");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
  input.classList.toggle("is-error", !valid);
  msg.classList.toggle("is-ok", valid);
  msg.textContent = valid
    ? "You're in — check your inbox on Sunday."
    : "Please enter a valid email address.";
  if (valid) input.value = "";
});

// ---------- Scroll reveal ----------
let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px" }
    );
  }
  $$(".reveal:not(.is-in)").forEach((el) => revealObserver.observe(el));
}

// ---------- Header state, active link, back-to-top ----------
const header = $("#header");
const toTop = $("#toTop");
const sections = $$("main section[id]");

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("is-stuck", y > 20);
  toTop.classList.toggle("is-visible", y > 600);

  let current = sections[0]?.id;
  sections.forEach((s) => {
    if (y >= s.offsetTop - 140) current = s.id;
  });
  $$(".nav__link").forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${current}`));
}
window.addEventListener("scroll", onScroll, { passive: true });

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Init ----------
$("#year").textContent = new Date().getFullYear();
renderChrome();
renderBooks();
observeReveals();
onScroll();
// Hero elements reveal immediately on load
requestAnimationFrame(() => $$(".hero .reveal").forEach((el) => el.classList.add("is-in")));
