import { blip } from "../lib/sounds.js";

/** Segmented tabs that morph code panels via a stacked-grid cross-fade. */
export function initUsageTabs(root = document) {
  const tabs = [...root.querySelectorAll(".tab")];
  const panels = [...root.querySelectorAll(".panel")];

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("active")) return;
      blip();
      for (const t of tabs) t.classList.toggle("active", t === tab);
      for (const p of panels) {
        p.classList.toggle("active", p.dataset.panel === tab.dataset.panel);
      }
    });
  }
}
