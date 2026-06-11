export { animateSlotText, buildSlotText, chromatic, clearSlotText, type ChromaticOptions, type SlotOptions, } from "./slotText.js";
import { type SlotOptions } from "./slotText.js";
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
export declare function slotText(element: HTMLElement, initialText: string, options?: SlotOptions): SlotTextController;
