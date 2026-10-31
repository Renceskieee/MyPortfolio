const nav = document.querySelector(".site-nav");
const menu = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");

// Old links used hash routes (e.g. main.html#_projects). Send them to the real pages.
const legacyRoutes = {
  _home: "./",
  home: "./",
  _projects: "projects.html",
  projects: "projects.html",
  _about: "about.html",
  about: "about.html",
  _contacts: "contact.html",
  contacts: "contact.html",
};
const legacyTarget = legacyRoutes[location.hash.slice(1)];
if (legacyTarget) location.replace(legacyTarget);

function ensureScrollTopButton() {
  const existingButton = document.querySelector(".scroll-top");
  if (existingButton) return existingButton;

  const button = document.createElement("button");
  button.className = "scroll-top";
  button.type = "button";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "↑";
  document.body.appendChild(button);
  return button;
}

const scrollTopButton = ensureScrollTopButton();

menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  menu.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
  nav.classList.toggle("is-open", !open);
});
nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
  }
});
scrollTopButton.addEventListener("click", () =>
  window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  }),
);
window.addEventListener(
  "scroll",
  () => scrollTopButton.classList.toggle("visible", scrollY > 300),
  { passive: true },
);
document.querySelector("#year").textContent = new Date().getFullYear();

function readSavedTheme() {
  try {
    return localStorage.getItem("rencyq-theme");
  } catch {
    return null;
  }
}
const preferredTheme =
  readSavedTheme() ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggle.setAttribute(
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
  );
}
setTheme(preferredTheme);
themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  try {
    localStorage.setItem("rencyq-theme", nextTheme);
  } catch {}
});

// Page scripts load after this file, so run their setup once the document is ready.
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const initializer = page && window[`init${page[0].toUpperCase() + page.slice(1)}`];
  if (initializer) initializer();
});
