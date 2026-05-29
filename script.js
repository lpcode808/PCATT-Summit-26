const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuButton && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const tabs = Array.from(document.querySelectorAll(".schedule-tab"));
const panels = Array.from(document.querySelectorAll(".schedule-panel"));
const stickyCta = document.querySelector(".sticky-cta");

const activateTab = (tab) => {
  tabs.forEach((candidate) => {
    const isActive = candidate === tab;
    candidate.classList.toggle("is-active", isActive);
    candidate.setAttribute("aria-selected", String(isActive));
    candidate.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.id === tab.getAttribute("aria-controls");
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    }

    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex]);
  });
});

if (stickyCta) {
  const syncStickyCta = () => {
    const isVisible = window.scrollY > 520;
    stickyCta.classList.toggle("is-visible", isVisible);
    stickyCta.setAttribute("aria-hidden", String(!isVisible));
    stickyCta.tabIndex = isVisible ? 0 : -1;
  };

  syncStickyCta();
  window.addEventListener("scroll", syncStickyCta, { passive: true });
}
