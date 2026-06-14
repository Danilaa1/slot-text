import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { slotText as solidSlotText } from "../src/solid.js";
import { slotText as svelteSlotText } from "../src/svelte.js";

let el: HTMLElement;

beforeEach(() => {
  vi.useFakeTimers();
  el = document.createElement("span");
  document.body.appendChild(el);
});

afterEach(() => {
  vi.useRealTimers();
  el.remove();
});

const readText = () =>
  Array.from(el.querySelectorAll<HTMLElement>(".char-slot"))
    .map((s) => s.dataset.char ?? "")
    .join("");

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
});
