# slot-text

Dependency-free text roll animation for tiny, tactile UI labels.

![slot-text usage card](./assets/usage.svg)

## Install

```bash
npm install slot-text
```

## Use

### Vanilla

```ts
import "slot-text/style.css";
import { slotText, chromatic } from "slot-text";

const label = slotText(document.querySelector("#copy")!, "Copy");

label.set("Copied", {
  direction: "up",
  color: chromatic(),
});
```

### React

```tsx
import "slot-text/style.css";
import { SlotText } from "slot-text/react";
import { chromatic } from "slot-text";

export function CopyLabel({ copied }: { copied: boolean }) {
  return (
    <SlotText
      text={copied ? "Copied" : "Copy"}
      options={{
        direction: copied ? "up" : "down",
        skipUnchanged: false,
        color: copied ? chromatic() : undefined,
      }}
    />
  );
}
```

### Vue

```vue
<script setup lang="ts">
import "slot-text/style.css";
import { SlotText } from "slot-text/vue";
import { chromatic } from "slot-text";

const options = {
  direction: "up",
  skipUnchanged: false,
  color: chromatic(),
} as const;
</script>

<template>
  <SlotText text="Copied" :options="options" />
</template>
```

## API

Vanilla controller:

```ts
const label = slotText(element, "Copy", options);

label.set("Copied");
label.set("Copy", { direction: "down" });
label.destroy();
```

Framework components:

```ts
import { SlotText as ReactSlotText } from "slot-text/react";
import { SlotText as VueSlotText } from "slot-text/vue";
```

Low-level helpers:

```ts
import {
  buildSlotText,
  animateSlotText,
  chromatic,
} from "slot-text";
```

## Options

```ts
type SlotOptions = {
  direction?: "up" | "down";
  stagger?: number;
  duration?: number;
  exitOffset?: number;
  easing?: string;
  bounce?: number;
  color?: string | ((index: number, total: number) => string);
  colorFade?: number;
  skipUnchanged?: boolean;
};
```

Defaults are tuned for a soft, springy roll:

```ts
{
  direction: "down",
  stagger: 45,
  duration: 300,
  exitOffset: 50,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: 0.6,
  colorFade: 280,
  skipUnchanged: true,
}
```

## Example

```html
<button>
  <span id="copy-label"></span>
</button>

<script type="module">
  import "slot-text/style.css";
  import { slotText } from "slot-text";

  const label = slotText(document.querySelector("#copy-label"), "Copy");

  document.querySelector("button").addEventListener("click", () => {
    label.set("Copied", { direction: "up", skipUnchanged: false });
    window.setTimeout(() => label.set("Copy"), 1400);
  });
</script>
```

## Notes

- Browser-only DOM utility.
- Core API has no runtime dependencies.
- React and Vue are optional peer dependencies. Plain JS users do not need them.
- Works best on short labels, buttons, counters, and command text.
- Import the CSS once before using the animation.
