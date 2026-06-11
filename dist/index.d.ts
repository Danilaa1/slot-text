export { animateSlotText, buildSlotText, chromatic, clearSlotText, type ChromaticOptions, type SlotOptions, } from "./slotText.js";
import { type SlotOptions } from "./slotText.js";
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
export declare function slotText(element: HTMLElement, initialText: string, options?: SlotOptions): SlotTextController;
