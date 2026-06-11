export {
  animateSlotText,
  buildSlotText,
  chromatic,
  clearSlotText,
  type ChromaticOptions,
  type SlotOptions,
} from "./slotText.js";

import {
  animateSlotText,
  buildSlotText,
  clearSlotText,
  type SlotOptions,
} from "./slotText.js";

export interface SlotTextController {
  readonly element: HTMLElement;
  readonly value: string;
  set(text: string, options?: SlotOptions): void;
  destroy(): void;
}

/**
 * Create a text-roll controller for one element.
 *
 * Import `slot-text/style.css` once in your app, then call:
 *
 *   const label = slotText(buttonLabel, "Copy");
 *   label.set("Copied", { direction: "up" });
 */
export function slotText(
  element: HTMLElement,
  initialText: string,
  options: SlotOptions = {},
): SlotTextController {
  let value = initialText;
  buildSlotText(element, initialText);

  return {
    element,
    get value() {
      return value;
    },
    set(text, nextOptions = {}) {
      value = text;
      animateSlotText(element, text, { ...options, ...nextOptions });
    },
    destroy() {
      clearSlotText(element, value);
    },
  };
}
