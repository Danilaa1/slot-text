export {
  animateSlotText,
  buildSlotText,
  chromatic,
  clearSlotText,
  type ChromaticOptions,
  type SlotOptions,
} from "./slotText.js";

import { animateSlotText, buildSlotText, clearSlotText, type SlotOptions } from "./slotText.js";

export interface FlashOptions {
  /** How long the flash text stays before rolling back, in ms (default 1400). */
  revertAfter?: number;
  /** Roll options for the flash text rolling in. */
  enter?: SlotOptions;
  /** Roll options for the original text rolling back. */
  exit?: SlotOptions;
}

export interface SlotTextController {
  readonly element: HTMLElement;
  /** The text currently displayed (the flash text while a flash is showing). */
  readonly value: string;
  /** Roll to new text. Cancels any pending flash revert. */
  set(text: string, options?: SlotOptions): void;
  /**
   * Roll to temporary text, then roll back automatically — the classic
   * Copy → Copied → Copy button in one call. Spam-safe: repeat flashes restart
   * the revert timer instead of queuing extra rolls.
   */
  flash(text: string, options?: FlashOptions): void;
  destroy(): void;
}

/**
 * Create a text-roll controller for one element.
 *
 * Import `slot-text/style.css` once in your app, then call:
 *
 *   const label = slotText(buttonLabel, "Copy");
 *   label.set("Copied", { direction: "up" });
 *   label.flash("Copied", { revertAfter: 1400 }); // auto-reverts to "Copy"
 */
export function slotText(
  element: HTMLElement,
  initialText: string,
  options: SlotOptions = {},
): SlotTextController {
  let value = initialText;
  let revertTimeout: number | undefined;
  let restingText: string | undefined;
  buildSlotText(element, initialText);

  return {
    element,
    get value() {
      return value;
    },
    set(text, nextOptions = {}) {
      // An explicit set wins over a pending flash revert.
      clearTimeout(revertTimeout);
      restingText = undefined;
      value = text;
      animateSlotText(element, text, { ...options, ...nextOptions });
    },
    flash(text, { revertAfter = 1400, enter, exit } = {}) {
      // Capture the resting text only on the first flash of a burst, so a
      // flash-during-flash still reverts to the original label.
      if (restingText === undefined) {
        restingText = value;
      }

      // Flashes default to non-interrupting rolls: spam-friendly, no mid-roll
      // cutoffs. Callers can still override via `enter`/`exit`.
      value = text;
      animateSlotText(element, text, {
        ...options,
        interrupt: false,
        ...enter,
      });

      // Restart the revert timer: one revert per burst, after the last flash.
      clearTimeout(revertTimeout);
      revertTimeout = window.setTimeout(() => {
        const back = restingText!;
        restingText = undefined;
        revertTimeout = undefined;
        value = back;
        animateSlotText(element, back, {
          ...options,
          interrupt: false,
          ...exit,
        });
      }, revertAfter);
    },
    destroy() {
      clearTimeout(revertTimeout);
      clearSlotText(element, value);
    },
  };
}
