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
const DEFAULTS = {
    direction: "down",
    stagger: 45,
    duration: 300,
    exitOffset: 50,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    bounce: 0.6,
    colorFade: 280,
    skipUnchanged: true,
    interrupt: true,
};
const NBSP = "\u00A0";
const glyph = (char) => (char === " " ? NBSP : char);
/**
 * Build a `color` function that sweeps the hue across the line, giving every
 * glyph its own color so the roll lands as a chromatic spectrum.
 *
 *   animateSlotText(el, txt, { color: chromatic() });            // full rainbow
 *   animateSlotText(el, txt, { color: chromatic({ from: 18 }) }); // start gold
 */
export function chromatic({ from = 0, spread = 320, saturation = 92, lightness = 60, } = {}) {
    return (index, total) => {
        const t = total <= 1 ? 0 : index / (total - 1);
        return `hsl(${(from + t * spread) % 360} ${saturation}% ${lightness}%)`;
    };
}
const states = new WeakMap();
/** Cancel any running animation on a container and snap it to its target text. */
function settle(container) {
    const state = states.get(container);
    if (!state)
        return;
    state.timers.forEach((t) => window.clearTimeout(t));
    states.delete(container);
    // Rebuild a pristine DOM at the text the interrupted roll was heading toward,
    // so the next animation starts from a clean, non-overlapping baseline.
    buildSlotText(container, state.target);
}
function makeFace(char) {
    const face = document.createElement("span");
    face.className = "char-face";
    face.textContent = glyph(char);
    return face;
}
function buildSlot(char) {
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
export function buildSlotText(container, text) {
    container.classList.add("slot-text");
    container.replaceChildren(...Array.from(text, buildSlot));
}
export function animateSlotText(container, toText, options = {}) {
    const { direction, stagger, duration, exitOffset, easing, bounce, color, colorFade, skipUnchanged, interrupt, } = {
        ...DEFAULTS,
        ...options,
    };
    // Non-interrupting mode: if a roll is already in flight, let it finish and
    // remember this request instead. Only the latest request survives, so spam
    // taps coalesce into a single follow-up roll once the current one lands.
    const running = states.get(container);
    if (running && !interrupt) {
        if (toText !== running.target) {
            running.pending = { text: toText, options };
        }
        return;
    }
    // Interrupt: if a previous roll is still running, fast-forward it to its
    // target and tear down its timers before we start fresh. This is what kills
    // the "switch bun→npm mid-animation" glitch.
    settle(container);
    // First run / empty container → just build it.
    if (!container.querySelector(".char-slot")) {
        buildSlotText(container, toText);
        return;
    }
    const slots = Array.from(container.querySelectorAll(".char-slot"));
    const fromText = slots.map((s) => s.dataset.char ?? "").join("");
    // Non-interrupting mode also drops rolls to the text already on screen, so
    // repeated triggers do not visibly re-roll an unchanged label.
    if (!interrupt && fromText === toText)
        return;
    const maxLen = Math.max(fromText.length, toText.length);
    // Whole-pixel slide distance = one cell height, so glyphs clip cleanly.
    // If layout has not produced dimensions yet, fall back to line-height/font-size
    // so the text still rolls instead of swapping in place.
    const sample = slots.find((s) => (s.dataset.char ?? "") !== "") ?? slots[0];
    const cs = getComputedStyle(container);
    // Ceil, not round: if the slide distance is even half a pixel short of the
    // cell height, a sliver of the outgoing glyph stays visible at the clip edge.
    const H = Math.ceil(sample?.getBoundingClientRect().height ||
        sample?.offsetHeight ||
        container.getBoundingClientRect().height ||
        parseFloat(cs.lineHeight) ||
        0) ||
        Math.ceil(parseFloat(cs.fontSize) * 1.3) ||
        18;
    // Resting color to settle the chromatic flash back to.
    const restColor = color ? cs.color : "";
    // Pre-create any extra cells up front so the row never reflows mid-roll.
    for (let i = slots.length; i < maxLen; i++) {
        const slot = buildSlot("");
        container.appendChild(slot);
        slots.push(slot);
    }
    const timers = [];
    const state = { timers, target: toText };
    states.set(container, state);
    // down: new enters from above (-H to 0), old exits below (0 to +H)
    // up:   new enters from below (+H to 0), old exits above (0 to -H)
    const outY = direction === "down" ? H : -H;
    const inStart = direction === "down" ? -H : H;
    // A tiny deterministic-feeling jitter in [-1, 1] per character. Scaled by
    // `bounce` it gives each glyph its own speed and a little tilt-wobble, so the
    // line does not land as one rigid block. Every letter has some personality.
    const wobble = (i, salt) => {
        const n = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    };
    // Track the slowest letter so the safety-net snap waits for everyone.
    let maxEnd = 0;
    for (let i = 0; i < maxLen; i++) {
        const fromChar = fromText[i] || "";
        const toChar = toText[i] || "";
        if (fromChar === toChar && (skipUnchanged || fromChar === ""))
            continue;
        const slot = slots[i];
        const sizer = slot.querySelector(".char-sizer");
        const oldFace = slot.querySelector(".char-face");
        // Resize the cell to the new glyph — but ease the width instead of
        // snapping it, so a wide outgoing glyph (W → i) is never cropped by a
        // suddenly-narrow cell and neighbouring letters glide rather than jump.
        const oldW = slot.getBoundingClientRect().width;
        sizer.textContent = glyph(toChar);
        const newW = sizer.getBoundingClientRect().width;
        const widthChanges = Math.abs(newW - oldW) > 0.5;
        if (widthChanges)
            slot.style.width = `${oldW}px`;
        // A cell growing from or collapsing to empty changes width drastically —
        // clip it horizontally while it resizes so its glyph wipes in/out with the
        // cell instead of spilling over and stacking onto the neighbours.
        if (fromChar === "" || toChar === "")
            slot.classList.add("is-resizing");
        const tint = typeof color === "function" ? color(i, maxLen) : color;
        // Per-letter personality: vary the speed, the stagger and a starting tilt
        // that springs back to upright as the glyph settles. Tilt is kept small so
        // rotated corners never swing into the neighbouring cells.
        // Tail cells (rolling out to nothing) join the same wave instead of
        // queuing behind it: they start mid-wave, roll a little faster, and are
        // gone before the new word finishes landing — so nothing trails.
        const isTail = toChar === "";
        const d = Math.round(duration * (isTail ? 0.75 : 1) * (1 + bounce * 0.45 * wobble(i, 1)));
        const staggerIndex = isTail
            ? toText.length * 0.5 + (i - toText.length) * 0.25
            : i;
        const base = Math.round(staggerIndex * stagger * (1 + bounce * 0.25 * wobble(i, 2)));
        const tilt = (bounce * 5 * wobble(i, 3)).toFixed(2);
        const rollTrans = `transform ${d}ms ${easing}`;
        const trans = color
            ? `${rollTrans}, color ${colorFade}ms linear ${d}ms`
            : rollTrans;
        const newFace = makeFace(toChar);
        newFace.style.transformOrigin = "50% 50%";
        newFace.style.transform = `translateY(${inStart}px) rotate(${tilt}deg)`;
        if (tint)
            newFace.style.color = tint;
        slot.appendChild(newFace);
        void slot.offsetWidth; // commit start transforms
        // Glide the cell to its new width with a clean ease-out (no overshoot) so
        // it never pinches narrower than either glyph. Timing depends on the kind
        // of change:
        //  - glyph → glyph: resize alongside the roll.
        //  - glyph → empty: let the glyph roll out vertically at full width FIRST,
        //    then snap the empty cell closed quickly — so the exit reads as a roll,
        //    not a horizontal crush.
        //  - empty → glyph: open the cell quickly BEFORE the glyph rolls in, so it
        //    arrives into a full-width cell.
        if (widthChanges) {
            let wDelay = base;
            let wDur = d;
            if (isTail) {
                // Keep full width while the glyph is visibly rolling (first ~55%),
                // then close just behind it — the exit reads as a roll, and the line
                // has fully contracted by the time the new word lands.
                wDelay = base + Math.round(d * 0.55);
                wDur = Math.max(140, Math.round(d * 0.6));
            }
            else if (fromChar === "") {
                wDur = Math.max(140, Math.round(d * 0.45));
            }
            timers.push(window.setTimeout(() => {
                slot.style.transition = `width ${wDur}ms cubic-bezier(0.2, 0, 0, 1)`;
                slot.style.width = `${newW}px`;
            }, wDelay));
            maxEnd = Math.max(maxEnd, wDelay + wDur);
        }
        maxEnd = Math.max(maxEnd, base + exitOffset + d + (color ? colorFade : 0));
        // Outgoing glyph slides away first (with its own little counter-tilt).
        if (oldFace) {
            timers.push(window.setTimeout(() => {
                oldFace.style.transition = rollTrans;
                oldFace.style.transform = `translateY(${outY}px) rotate(${-Number(tilt)}deg)`;
            }, base));
        }
        // Incoming glyph chases it in (and, if tinted, fades to rest afterwards).
        timers.push(window.setTimeout(() => {
            newFace.style.transition = trans;
            newFace.style.transform = "translateY(0) rotate(0deg)";
            if (color)
                newFace.style.color = restColor;
            const done = (e) => {
                if (e.propertyName !== "transform")
                    return; // ignore the colour fade
                newFace.removeEventListener("transitionend", done);
                slot.dataset.char = toChar;
                // Hand sizing back to the sizer (same px, so nothing visibly moves).
                slot.style.removeProperty("transition");
                slot.style.removeProperty("width");
                slot.classList.remove("is-resizing");
                slot.querySelectorAll(".char-face").forEach((f) => {
                    if (f !== newFace)
                        f.remove();
                });
            };
            newFace.addEventListener("transitionend", done);
        }, base + exitOffset));
    }
    // Safety net: snap to a pristine DOM once the slowest letter has settled.
    // If a non-interrupting call was deferred mid-roll, replay it now — it runs
    // as a fresh roll from this clean baseline.
    const total = maxEnd + 80;
    timers.push(window.setTimeout(() => {
        const pending = state.pending;
        states.delete(container);
        buildSlotText(container, toText);
        if (pending) {
            animateSlotText(container, pending.text, pending.options);
        }
    }, total));
}
export function clearSlotText(container, text = "") {
    settle(container);
    container.classList.remove("slot-text");
    container.textContent = text;
}
