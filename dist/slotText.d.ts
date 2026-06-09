/**
 * slotText - a dependency-free "text roll" animation.
 *
 * Adapted from motion-primitives' TextRoll (vertical-slide variant): each
 * character sits in its own clipped cell and changes by sliding. The new
 * glyph enters from one side while the old glyph slides out the other, with
 * the incoming glyph chasing the outgoing one by a stagger step. Pure
 * transform/transition, GPU-composited, with a springy overshoot easing, so
 * every letter lands with a little bounce.
 *
 *   buildSlotText(el, "Copy");                       // initialise
 *   animateSlotText(el, "Copied", { direction: "up" }); // animate to new text
 */
export interface SlotOptions {
    /** "down" rolls glyphs downward (enter from top); "up" rolls upward. */
    direction?: "up" | "down";
    /** Per-character stagger in ms (default 45). */
    stagger?: number;
    /** Slide duration per character in ms (default 300). */
    duration?: number;
    /** How long the incoming glyph trails the outgoing one, in ms (default 50). */
    exitOffset?: number;
    /** Easing — defaults to a springy, overshooting "back" curve. */
    easing?: string;
    /**
     * Per-letter personality: 0 = every glyph lands identically, 1 = lots of
     * individual variation in speed and a little tilt-wobble as each settles.
     * Default 0.6.
     */
    bounce?: number;
    /**
     * Chromatic flash: each incoming glyph rolls in tinted, then fades to its
     * resting color once it lands. Pass a single CSS color for a flat tint, or a
     * function `(index, total) => color` to give every glyph its own hue. That's
     * what produces the spectrum/rainbow sweep across the line. Omit for no flash.
     */
    color?: string | ((index: number, total: number) => string);
    /** How long the chromatic tint takes to fade back to rest, in ms (default 280). */
    colorFade?: number;
    /**
     * Keep characters that are identical at the same index static. Ideal for
     * short aligned labels (Copy to Copied). Turn off when the shared parts of the
     * two strings are misaligned (different lengths) so the whole line rolls
     * uniformly instead of leaving stray letters frozen.
     */
    skipUnchanged?: boolean;
}
export interface ChromaticOptions {
    from?: number;
    spread?: number;
    saturation?: number;
    lightness?: number;
}
/**
 * Build a `color` function that sweeps the hue across the line, giving every
 * glyph its own color so the roll lands as a chromatic spectrum.
 *
 *   animateSlotText(el, txt, { color: chromatic() });            // full rainbow
 *   animateSlotText(el, txt, { color: chromatic({ from: 18 }) }); // start gold
 */
export declare function chromatic({ from, spread, saturation, lightness, }?: ChromaticOptions): (index: number, total: number) => string;
export declare function buildSlotText(container: HTMLElement, text: string): void;
export declare function animateSlotText(container: HTMLElement, toText: string, options?: SlotOptions): void;
export declare function clearSlotText(container: HTMLElement, text?: string): void;
