export { animateSlotText, buildSlotText, chromatic, clearSlotText, } from "./slotText";
import { animateSlotText, buildSlotText, clearSlotText, } from "./slotText";
/**
 * Create a text-roll controller for one element.
 *
 * Import `slot-text/style.css` once in your app, then call:
 *
 *   const label = slotText(buttonLabel, "Copy");
 *   label.set("Copied", { direction: "up" });
 */
export function slotText(element, initialText, options = {}) {
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
