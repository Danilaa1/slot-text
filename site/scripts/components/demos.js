import { slotLabel, lockWidth, chromatic } from "../lib/slot-label.js";
import { tick } from "../lib/sounds.js";

/** "Copy → Copied" button demo. */
export function initCopyDemo(button) {
  const labelEl = button.querySelector(".lockable");
  lockWidth(labelEl, ["Copy", "Copied"]);
  const label = slotLabel(labelEl, "Copy");

  button.addEventListener("click", () => {
    tick();
    label.set("Copied", {
      direction: "up",
      skipUnchanged: false,
      color: chromatic({ from: 190 }),
    });
    window.setTimeout(
      () => label.set("Copy", { direction: "down", skipUnchanged: false }),
      1400,
    );
  });
}

/** Toggling status demo. */
export function initStatusDemo(button) {
  const labelEl = button.querySelector(".lockable");
  lockWidth(labelEl, ["Operational", "Deploying"]);
  const label = slotLabel(labelEl, "Operational");
  let busy = false;

  button.addEventListener("click", () => {
    tick();
    busy = !busy;
    button.classList.toggle("busy", busy);
    label.set(busy ? "Deploying" : "Operational", {
      direction: "up",
      skipUnchanged: false,
    });
  });
}

/** Slow-looping numeric counter demo. */
export function initCounterDemo(labelEl, { max = 99999, intervalMs = 2800 } = {}) {
  const fmt = new Intl.NumberFormat("en-US");
  let value = 12480;
  lockWidth(labelEl, [fmt.format(max)]);
  const label = slotLabel(labelEl, fmt.format(value));

  window.setInterval(() => {
    const delta = Math.round((Math.random() - 0.42) * 600);
    value = Math.min(max, Math.max(800, value + delta));
    label.set(fmt.format(value), { direction: delta >= 0 ? "down" : "up" });
  }, intervalMs);
}
