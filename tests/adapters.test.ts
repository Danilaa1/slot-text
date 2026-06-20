import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type SlotOptions } from "../src/index.js";
import { slotText as solidSlotText } from "../src/solid.js";
import { slotText as svelteSlotText } from "../src/svelte.js";

let el: HTMLElement;
let style: HTMLStyleElement;

const SLOT_TEXT_CSS = `
  .slot-text {
    display: inline-flex;
  }

  .char-slot {
    position: relative;
    display: inline-flex;
  }

  .char-face {
    position: absolute;
  }
`;

beforeEach(() => {
  vi.useFakeTimers();
  style = document.createElement("style");
  style.textContent = SLOT_TEXT_CSS;
  document.head.appendChild(style);
  el = document.createElement("span");
  document.body.appendChild(el);
});

afterEach(() => {
  vi.useRealTimers();
  style.remove();
  el.remove();
});

const readText = () =>
  Array.from(el.querySelectorAll<HTMLElement>(".char-slot"))
    .map((s) => s.dataset.char ?? "")
    .join("");

const hasTintedFace = () =>
  Array.from(el.querySelectorAll<HTMLElement>(".char-face")).some(
    (face) => face.style.color === "red",
  );

describe("Solid adapter", () => {
  it("updates text through the directive lifecycle", () => {
    let dispose!: () => void;
    let setText!: (text: string) => string;

    createRoot((rootDispose) => {
      dispose = rootDispose;
      const [text, setLabel] = createSignal("Copy");
      setText = setLabel;

      solidSlotText(el, () => ({ text: text() }));
      expect(readText()).toBe("Copy");
    });

    setText("Copied");
    vi.runAllTimers();
    expect(readText()).toBe("Copied");

    dispose();
    expect(el.classList.contains("slot-text")).toBe(false);
    expect(el.textContent).toBe("Copied");
  });

  it("does not pin initial options as defaults for later updates", () => {
    let setText!: (text: string) => string;
    let setOptions!: (options: SlotOptions | undefined) => void;

    createRoot((dispose) => {
      const [text, setLabel] = createSignal("Copy");
      const [options, setNextOptions] = createSignal<SlotOptions | undefined>({
        color: "red",
      });
      setText = setLabel;
      setOptions = setNextOptions;

      solidSlotText(el, () => ({ text: text(), options: options() }));

      setOptions(undefined);
      setText("Done");

      expect(hasTintedFace()).toBe(false);

      dispose();
    });
  });
});

describe("Svelte adapter", () => {
  it("updates text through the action lifecycle", () => {
    const action = svelteSlotText(el, { text: "Copy" });
    expect(readText()).toBe("Copy");

    action.update({ text: "Copied" });
    vi.runAllTimers();
    expect(readText()).toBe("Copied");

    action.destroy();
    expect(el.classList.contains("slot-text")).toBe(false);
    expect(el.textContent).toBe("Copied");
  });

  it("does not pin initial options as defaults for later updates", () => {
    const action = svelteSlotText(el, {
      text: "Copy",
      options: { color: "red" },
    });

    action.update({ text: "Done" });

    expect(hasTintedFace()).toBe(false);

    action.destroy();
  });
});
