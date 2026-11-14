/**
 * ufo-tabs — onglets accessibles (motif ARIA « Tabs », activation
 * automatique) : clic, flèches gauche/droite, Début/Fin. L'onglet dont le
 * panneau est visé par l'ancre de l'URL (#…) est ouvert au chargement.
 */
/**
 * @param {HTMLElement} root Élément racine du bloc ([data-ufo-tabs]).
 */
const init = (root) => {
  const tablist = root.querySelector('[role="tablist"]');
  if (!tablist) {
    return;
  }
  const tabs = Array.from(tablist.querySelectorAll(':scope > [role="tab"]'));
  const panelOf = (tab) =>
    document.getElementById(tab.getAttribute("aria-controls"));

  const activate = (tab, focus = false) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
      const panel = panelOf(item);
      if (panel) {
        panel.hidden = !selected;
      }
    });
    if (focus) {
      tab.focus();
    }
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));

  tablist.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(tablist.ownerDocument.activeElement);
    if (index === -1) {
      return;
    }
    const last = tabs.length - 1;
    const rtl = window.getComputedStyle(tablist).direction === "rtl";
    const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
    let target;
    if (next) {
      target = tabs[(index + next + tabs.length) % tabs.length];
    } else if (event.key === "Home") {
      target = tabs[0];
    } else if (event.key === "End") {
      target = tabs[last];
    }
    if (target) {
      event.preventDefault();
      activate(target, true);
    }
  });

  // Ancre de l'URL : ouvre l'onglet dont le panneau contient la cible.
  let target = null;
  try {
    target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    // Ancre mal encodée : on garde l'onglet par défaut.
  }
  const fromHash = target && tabs.find((tab) => panelOf(tab)?.contains(target));
  if (fromHash) {
    activate(fromHash);
  }
};

const start = () => document.querySelectorAll("[data-ufo-tabs]").forEach(init);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
