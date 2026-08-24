const content = document.querySelector("#page-content");
const nav = document.querySelector(".site-nav");
const menu = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const routes = ["_home", "_projects", "_about", "_contacts"];
const routeToPage = {
  _home: "home",
  _projects: "projects",
  _about: "about",
  _contacts: "contacts",
};
const legacyRouteMap = {
  home: "_home",
  projects: "_projects",
  about: "_about",
  contacts: "_contacts",
};

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

async function loadPage() {
  const currentHash = location.hash.slice(1);
  const route = routes.includes(currentHash)
    ? currentHash
    : legacyRouteMap[currentHash] ?? "_home";
  const page = routeToPage[route] ?? "home";
  if (location.hash !== `#${route}`) history.replaceState(null, "", `#${route}`);
  content.classList.add("is-loading");
  try {
    const response = await fetch(`pages/${page}.html`, { cache: "no-store" });
    if (!response.ok) throw new Error("Page not found");
    const existingViewer = document.querySelector(".image-viewer");
    existingViewer?.cleanup?.();
    existingViewer?.remove();
    document.body.classList.remove("viewer-open");
    content.innerHTML = await response.text();
    document.title = "Renceskieee";
    document
      .querySelectorAll("[data-page]")
      .forEach((link) =>
        link.classList.toggle("active", link.dataset.page === route),
      );
    window.scrollTo({ top: 0, behavior: "smooth" });
    initializePage(page);
  } catch {
    content.innerHTML =
      '<section class="error-state"><h1>Something went wrong.</h1><a class="button button-primary" href="#_home">Back home</a></section>';
  } finally {
    content.classList.remove("is-loading");
  }
}

function initializePage(page) {
  const initializer = window[`init${page[0].toUpperCase() + page.slice(1)}`];
  if (initializer) initializer();
}

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
  window.scrollTo({ top: 0, behavior: "smooth" }),
);
window.addEventListener(
  "scroll",
  () => scrollTopButton.classList.toggle("visible", scrollY > 300),
  { passive: true },
);
window.addEventListener("hashchange", loadPage);
document.querySelector("#year").textContent = new Date().getFullYear();
const savedTheme = localStorage.getItem("rencyq-theme");
const preferredTheme =
  savedTheme ||
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
  localStorage.setItem("rencyq-theme", nextTheme);
});
loadPage();
