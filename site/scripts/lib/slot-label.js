import { buildSlotText, animateSlotText } from "../../../dist/slotText.js";

/**
 * Small controller around slot-text's low-level API.
 * (dist/index.js uses an extensionless import that browsers can't load raw.)
 */
export function slotLabel(element, initialText, defaults = {}) {
  buildSlotText(element, initialText);
  return {
    set: (text, options = {}) =>
      animateSlotText(element, text, { ...defaults, ...options }),
  };
}

/**
 * Lock an element's min-width to its widest possible text so the
 * surrounding layout never shifts while a roll is in flight.
 */
export function lockWidth(element, texts) {
  const probe = element.cloneNode(false);
  probe.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;min-width:0";
  element.parentNode.appendChild(probe);
  let max = 0;
  for (const text of texts) {
    buildSlotText(probe, text);
    max = Math.max(max, probe.getBoundingClientRect().width);
  }
  probe.remove();
  element.style.minWidth = `${Math.ceil(max)}px`;
}

export { chromatic } from "../../../dist/slotText.js";
