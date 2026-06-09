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

const DEFAULTS = {
  direction: "down" as const,
  stagger: 45,
  duration: 300,
  exitOffset: 50,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: 0.6,
  colorFade: 280,
  skipUnchanged: true,
};

const NBSP = "\u00A0";
const glyph = (char: string) => (char === " " ? NBSP : char);

/**
 * Build a `color` function that sweeps the hue across the line, giving every
 * glyph its own color so the roll lands as a chromatic spectrum.
 *
 *   animateSlotText(el, txt, { color: chromatic() });            // full rainbow
 *   animateSlotText(el, txt, { color: chromatic({ from: 18 }) }); // start gold
 */
export function chromatic({
  from = 0,
  spread = 320,
  saturation = 92,
  lightness = 60,
}: ChromaticOptions = {}) {
  return (index: number, total: number) => {
    const t = total <= 1 ? 0 : index / (total - 1);
    return `hsl(${(from + t * spread) % 360} ${saturation}% ${lightness}%)`;
  };
}

/** Per-container record of the in-flight animation, so we can interrupt it. */
interface SlotState {
  timers: number[];
  target: string;
}
const states = new WeakMap<HTMLElement, SlotState>();

/** Cancel any running animation on a container and snap it to its target text. */
function settle(container: HTMLElement) {
  const state = states.get(container);
  if (!state) return;
  state.timers.forEach((t) => window.clearTimeout(t));
  states.delete(container);
  // Rebuild a pristine DOM at the text the interrupted roll was heading toward,
  // so the next animation starts from a clean, non-overlapping baseline.
  buildSlotText(container, state.target);
}

function makeFace(char: string) {
  const face = document.createElement("span");
  face.className = "char-face";
  face.textContent = glyph(char);
  return face;
}

function buildSlot(char: string) {
  const slot = document.createElement("span");
  slot.className = "char-slot";
  slot.dataset.char = char;

  // Invisible sizer keeps the cell exactly the width/height of its glyph, so
  // the absolutely-positioned animating faces never reflow the line.
  const sizer = document.createElement("span");
  sizer.className = "char-sizer";
  sizer.textContent = glyph(char);

  slot.append(sizer, makeFace(char));
  return slot;
}

export function buildSlotText(container: HTMLElement, text: string) {
  container.classList.add("slot-text");
  container.replaceChildren(...Array.from(text, buildSlot));
}

export function animateSlotText(
  container: HTMLElement,
  toText: string,
  options: SlotOptions = {},
) {
  const {
    direction,
    stagger,
    duration,
    exitOffset,
    easing,
    bounce,
    color,
    colorFade,
    skipUnchanged,
  } = {
    ...DEFAULTS,
    ...options,
  };

  // Interrupt: if a previous roll is still running, fast-forward it to its
  // target and tear down its timers before we start fresh. This is what kills
  // the "switch bun→npm mid-animation" glitch.
  settle(container);

  // First run / empty container → just build it.
  if (!container.querySelector(".char-slot")) {
    buildSlotText(container, toText);
    return;
  }

  const slots = Array.from(container.querySelectorAll<HTMLElement>(".char-slot"));
  const fromText = slots.map((s) => s.dataset.char ?? "").join("");
  const maxLen = Math.max(fromText.length, toText.length);

  // Whole-pixel slide distance = one cell height, so glyphs clip cleanly.
  // If layout has not produced dimensions yet, fall back to line-height/font-size
  // so the text still rolls instead of swapping in place.
  const sample = slots.find((s) => (s.dataset.char ?? "") !== "") ?? slots[0];
  const cs = getComputedStyle(container);
  const H =
    Math.round(
      sample?.getBoundingClientRect().height ||
        sample?.offsetHeight ||
        container.getBoundingClientRect().height ||
        parseFloat(cs.lineHeight) ||
        0,
    ) || Math.round(parseFloat(cs.fontSize) * 1.3) || 18;

  // Resting color to settle the chromatic flash back to.
  const restColor = color ? cs.color : "";

  // Pre-create any extra cells up front so the row never reflows mid-roll.
  for (let i = slots.length; i < maxLen; i++) {
    const slot = buildSlot("");
    container.appendChild(slot);
    slots.push(slot);
  }

  const timers: number[] = [];
  const state: SlotState = { timers, target: toText };
  states.set(container, state);

  // down: new enters from above (-H to 0), old exits below (0 to +H)
  // up:   new enters from below (+H to 0), old exits above (0 to -H)
  const outY = direction === "down" ? H : -H;
  const inStart = direction === "down" ? -H : H;

  // A tiny deterministic-feeling jitter in [-1, 1] per character. Scaled by
  // `bounce` it gives each glyph its own speed and a little tilt-wobble, so the
  // line does not land as one rigid block. Every letter has some personality.
  const wobble = (i: number, salt: number) => {
    const n = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  };

  // Track the slowest letter so the safety-net snap waits for everyone.
  let maxEnd = 0;

  for (let i = 0; i < maxLen; i++) {
    const fromChar = fromText[i] || "";
    const toChar = toText[i] || "";
    if (fromChar === toChar && (skipUnchanged || fromChar === "")) continue;

    const slot = slots[i];
    const sizer = slot.querySelector<HTMLElement>(".char-sizer")!;
    const oldFace = slot.querySelector<HTMLElement>(".char-face");

    sizer.textContent = glyph(toChar); // resize the cell to the new glyph

    const tint = typeof color === "function" ? color(i, maxLen) : color;

    // Per-letter personality: vary the speed, the stagger and a starting tilt
    // that springs back to upright as the glyph settles.
    const d = Math.round(duration * (1 + bounce * 0.45 * wobble(i, 1)));
    const base = Math.round(i * stagger * (1 + bounce * 0.25 * wobble(i, 2)));
    const tilt = (bounce * 9 * wobble(i, 3)).toFixed(2);

    const rollTrans = `transform ${d}ms ${easing}`;
    const trans = color ? `${rollTrans}, color ${colorFade}ms linear ${d}ms` : rollTrans;

    const newFace = makeFace(toChar);
    newFace.style.transformOrigin = "50% 50%";
    newFace.style.transform = `translateY(${inStart}px) rotate(${tilt}deg)`;
    if (tint) newFace.style.color = tint;
    slot.appendChild(newFace);

    void slot.offsetWidth; // commit start transforms

    maxEnd = Math.max(maxEnd, base + exitOffset + d + (color ? colorFade : 0));

    // Outgoing glyph slides away first (with its own little counter-tilt).
    if (oldFace) {
      timers.push(
        window.setTimeout(() => {
          oldFace.style.transition = rollTrans;
          oldFace.style.transform = `translateY(${outY}px) rotate(${-Number(tilt)}deg)`;
        }, base),
      );
    }

    // Incoming glyph chases it in (and, if tinted, fades to rest afterwards).
    timers.push(
      window.setTimeout(() => {
        newFace.style.transition = trans;
        newFace.style.transform = "translateY(0) rotate(0deg)";
        if (color) newFace.style.color = restColor;

        const done = (e: TransitionEvent) => {
          if (e.propertyName !== "transform") return; // ignore the colour fade
          newFace.removeEventListener("transitionend", done);
          slot.dataset.char = toChar;
          slot.querySelectorAll(".char-face").forEach((f) => {
            if (f !== newFace) f.remove();
          });
        };
        newFace.addEventListener("transitionend", done);
      }, base + exitOffset),
    );
  }

  // Safety net: snap to a pristine DOM once the slowest letter has settled.
  const total = maxEnd + 80;
  timers.push(
    window.setTimeout(() => {
      states.delete(container);
      buildSlotText(container, toText);
    }, total),
  );
}

export function clearSlotText(container: HTMLElement, text = "") {
  settle(container);
  container.classList.remove("slot-text");
  container.textContent = text;
}
