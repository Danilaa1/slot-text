import { slotLabel, lockWidth, chromatic } from "../lib/slot-label.js";
import { chime } from "../lib/sounds.js";

const COMMAND = "npm i slot-text";
const COPIED = "copied";
const RESET_MS = 1600;

/** Click-to-copy install field with rolling label and icon morph. */
export function initInstall(button) {
  const labelEl = button.querySelector(".lockable");
  lockWidth(labelEl, [COMMAND, COPIED]);
  const label = slotLabel(labelEl, COMMAND);
  let timer;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
    } catch {
      /* clipboard unavailable — still play the feedback */
    }
    chime();
    button.classList.add("copied");
    label.set(COPIED, {
      direction: "up",
      skipUnchanged: false,
      color: chromatic({ from: 120, spread: 60 }),
    });
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      button.classList.remove("copied");
      label.set(COMMAND, { direction: "down", skipUnchanged: false });
    }, RESET_MS);
  });
}
