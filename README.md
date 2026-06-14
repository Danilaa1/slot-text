# slot-text

<p>
  <a href="https://www.npmjs.com/package/slot-text"><img src="https://img.shields.io/npm/v/slot-text?color=cb3837&label=npm" alt="npm version"></a>
  <img src="https://img.shields.io/badge/dependencies-zero-22c55e" alt="zero dependencies">
  <img src="https://img.shields.io/bundlephobia/minzip/slot-text?color=8b5cf6&label=size" alt="bundle size">
  <img src="https://img.shields.io/badge/react-✓-61dafb" alt="react">
  <img src="https://img.shields.io/badge/vue-✓-42b883" alt="vue">
  <img src="https://img.shields.io/badge/typescript-✓-3178c6" alt="typescript">
</p>

Dependency-free text roll animation for tiny, tactile UI labels.

## 📦 Install

```bash
npm install slot-text
```

## 🚀 Quick start

```ts
import "slot-text/style.css";
import { slotText, chromatic } from "slot-text";

const label = slotText(document.querySelector("#copy")!, "Copy");

// the classic Copy → Copied → Copy, in one call
label.flash("Copied", { enter: { color: chromatic() } });
```

That's it — import the CSS once, attach to an element, roll text.

## 🧩 API

| Method | What it does |
| --- | --- |
| `set(text, options?)` | Roll to new text — the text **stays** |
| `flash(text, options?)` | Roll in, then **auto-revert** to the previous text |
| `destroy()` | Clean up |

```ts
const label = slotText(element, "Copy", options);

label.set("Copied");                  // permanent change
label.set("Copy", { direction: "down" });
label.flash("Copied");                // temporary — rolls back after 1.4s
label.destroy();
```

> 💡 **`flash` is spam-safe** — repeat clicks restart the revert timer instead
> of queuing extra rolls, and an explicit `set()` cancels any pending revert.

```ts
label.flash("Copied", {
  revertAfter: 1400,                              // ms before rolling back
  enter: { direction: "up", color: chromatic() }, // roll-in
  exit: { direction: "down" },                    // roll-back
});
```

## ⚛️ React

```tsx
import "slot-text/style.css";
import { SlotText } from "slot-text/react";
import { chromatic } from "slot-text";

<SlotText
  text={copied ? "Copied" : "Copy"}
  options={{ direction: copied ? "up" : "down", color: copied ? chromatic() : undefined }}
/>
```

## 💚 Vue

```vue
<script setup lang="ts">
import "slot-text/style.css";
import { SlotText } from "slot-text/vue";
</script>

<template>
  <SlotText text="Copied" :options="{ direction: 'up' }" />
</template>
```

## ⚙️ Options

| Option | Default | Description |
| --- | --- | --- |
| `direction` | `"down"` | Roll direction: `"up"` or `"down"` |
| `stagger` | `45` | Delay between characters (ms) |
| `duration` | `300` | Per-character animation time (ms) |
| `exitOffset` | `50` | Delay before the old character exits (ms) |
| `easing` | springy bezier | CSS easing function |
| `bounce` | `0.6` | Overshoot amount |
| `color` | — | Color string, or `(index, total) => string` |
| `colorFade` | `280` | Fade back to base color (ms) |
| `skipUnchanged` | `true` | Don't re-roll identical characters |
| `interrupt` | `true` | See below 👇 |

### 🛑 `interrupt`

- `interrupt: true` *(default)* — cuts off any roll in flight, starts fresh.
- `interrupt: false` — lets the current roll **finish**; the latest call plays
  after it lands, duplicates are dropped. Ideal for spam-prone buttons.

### 🌈 `chromatic()`

Built-in rainbow color helper — pass it as `color` for a per-character hue sweep.

## 🔤 Font support

Each character animates in its own measured cell using your element's exact
font, so widths are always correct.

✅ **Great with:** monospace fonts, proportional Latin / Cyrillic / Greek
(Geist, Inter, SF, …), italics, glyphs with overhang.

⚠️ **Tradeoffs** (inherent to any per-character slot animation):

- Kerning is lost — pairs like `AV` sit slightly looser (invisible at label sizes).
- Ligatures won't form (`fi`, `fl`, coding ligatures).
- Joined scripts (Arabic, Devanagari) render as isolated forms.
- ZWJ emoji sequences (👨‍👩‍👧) split into cells; single emoji are fine.
- Very tall display fonts may clip at the roll mask (`line-height: 1.3`).

**In short:** ideal for short labels, numbers, statuses and commands — in
essentially any font you'd use for those.

## 📝 Notes

- Browser-only DOM utility, zero runtime dependencies.
- React and Vue are optional peer dependencies — plain JS users don't need them.
- Import the CSS once before using the animation.
- If `slot-text/style.css` arrives late, the controller keeps the final text
  readable and skips that roll instead of briefly exposing duplicated glyph
  faces. See `examples/css-race`.
- Low-level helpers also exported: `buildSlotText`, `animateSlotText`, `chromatic`.
