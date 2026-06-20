# slot-text

<p>
  <a href="https://www.npmjs.com/package/slot-text"><img src="https://img.shields.io/npm/v/slot-text?color=cb3837&label=npm" alt="npm version"></a>
  <img src="https://img.shields.io/badge/dependencies-zero-22c55e" alt="zero dependencies">
  <img src="https://img.shields.io/bundlephobia/minzip/slot-text?color=8b5cf6&label=size" alt="bundle size">
  <img src="https://img.shields.io/badge/react-✓-61dafb" alt="react">
  <img src="https://img.shields.io/badge/vue-✓-42b883" alt="vue">
  <img src="https://img.shields.io/badge/solid-✓-2c4f7c" alt="solid">
  <img src="https://img.shields.io/badge/svelte-✓-ff3e00" alt="svelte">
  <img src="https://img.shields.io/badge/typescript-✓-3178c6" alt="typescript">
</p>

Dependency-free text roll animation for tiny, tactile UI labels.

## 📦 Install

Choose your preferred package manager:

**npm**

```bash
npm install slot-text
```

**pnpm**

```bash
pnpm add slot-text
```

**Bun**

```bash
bun add slot-text
```

**Yarn**

```bash
yarn add slot-text
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

## 🔷 Solid

```tsx
import "slot-text/style.css";
import { createSignal } from "solid-js";
import { slotText } from "slot-text/solid";

const [label, setLabel] = createSignal("Copy");

<button aria-label={label()} onClick={() => setLabel("Copied")}>
  <span use:slotText={{ text: label(), options: { direction: "up" } }} />
</button>
```

## 🧡 Svelte

```svelte
<script lang="ts">
  import "slot-text/style.css";
  import { slotText } from "slot-text/svelte";

  let label = "Copy";
</script>

<button aria-label={label} on:click={() => label = "Copied"}>
  <span use:slotText={{ text: label, options: { direction: "up" } }}></span>
</button>
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
- React, Vue, Solid, and Svelte are optional peer dependencies — plain JS users
  don't need them.
- Import the CSS once before using the animation.
- Low-level helpers also exported: `buildSlotText`, `animateSlotText`, `chromatic`.

## 🤝 Contributing

We welcome contributions to the slot-text project! If you have suggestions, improvements, or fixes, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear messages.
4. Submit a pull request detailing your changes.

Please ensure that your code adheres to the existing style and includes appropriate tests where applicable.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more details.
