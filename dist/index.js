export { animateSlotText, buildSlotText, chromatic, clearSlotText, } from "./slotText.js";
import { animateSlotText, buildSlotText, clearSlotText, } from "./slotText.js";
/**
 * Create a text-roll controller for one element.
 *
 * Import `slot-text/style.css` once in your app, then call:
 *
 *   const label = slotText(buttonLabel, "Copy");
 *   label.set("Copied", { direction: "up" });
 *   label.flash("Copied", { revertAfter: 1400 }); // auto-reverts to "Copy"
 */
export function slotText(element, initialText, options = {}) {
    let value = initialText;
    let revertTimeout;
    let restingText;
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
                const back = restingText;
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
