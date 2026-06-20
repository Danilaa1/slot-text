import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { slotText } from "../src/index.js";
import { animateSlotText, buildSlotText } from "../src/slotText.js";

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

describe("slotText() initial DOM", () => {
  it("builds one slot per character with sizer and face", () => {
    slotText(el, "Copy");

    expect(el.classList.contains("slot-text")).toBe(true);
    const slots = el.querySelectorAll(".char-slot");
    expect(slots).toHaveLength(4);
    for (const slot of slots) {
      expect(slot.querySelector(".char-sizer")).not.toBeNull();
      expect(slot.querySelectorAll(".char-face")).toHaveLength(1);
    }
    expect(readText()).toBe("Copy");
  });

  it("renders spaces as NBSP in faces", () => {
    slotText(el, "a b");
    const faces = el.querySelectorAll(".char-face");
    expect(faces[1].textContent).toBe("\u00A0");
  });
});

describe("missing CSS fallback", () => {
  beforeEach(() => {
    style.remove();
  });

  it("keeps exact plain text on initial render and set()", () => {
    const label = slotText(el, "Take the next step");

    expect(label.value).toBe("Take the next step");
    expect(el.textContent).toBe("Take the next step");
    expect(el.querySelector(".char-slot")).toBeNull();

    label.set("Take the next step", { skipUnchanged: false });

    expect(label.value).toBe("Take the next step");
    expect(el.textContent).toBe("Take the next step");
    expect(el.querySelector(".char-slot")).toBeNull();
  });

  it("replaces unstyled slot markup with plain target text", () => {
    buildSlotText(el, "Take");
    expect(el.textContent).toBe("TTaakkee");

    animateSlotText(el, "Take the next step");

    expect(el.textContent).toBe("Take the next step");
    expect(el.querySelector(".char-slot")).toBeNull();
  });
});

describe("set()", () => {
  it("rolls to the new text and settles there", () => {
    const label = slotText(el, "Copy");

    label.set("Copied");
    vi.runAllTimers();

    expect(label.value).toBe("Copied");
    expect(readText()).toBe("Copied");
  });

  it("grows and shrinks the slot count to match the new text", () => {
    const label = slotText(el, "Hi");

    label.set("Hello");
    vi.runAllTimers();
    expect(el.querySelectorAll(".char-slot")).toHaveLength(5);
    expect(readText()).toBe("Hello");

    label.set("Yo");
    vi.runAllTimers();
    expect(el.querySelectorAll(".char-slot")).toHaveLength(2);
    expect(readText()).toBe("Yo");
  });

  it("lands on the last value after rapid set() calls", () => {
    const label = slotText(el, "one");

    label.set("two");
    label.set("three");
    label.set("four");
    vi.runAllTimers();

    expect(label.value).toBe("four");
    expect(readText()).toBe("four");
  });

  it("keeps the same text when set() receives the current value", () => {
    const label = slotText(el, "Copy");

    label.set("Copy");
    vi.runAllTimers();

    expect(label.value).toBe("Copy");
    expect(el.querySelectorAll(".char-slot")).toHaveLength(4);
    expect(readText()).toBe("Copy");
  });

  it("supports empty initial text", () => {
    const label = slotText(el, "");

    expect(label.value).toBe("");
    expect(readText()).toBe("");
    expect(el.querySelectorAll(".char-slot")).toHaveLength(0);
  });

  it("clears slots when set() receives an empty string", () => {
    const label = slotText(el, "Copy");

    label.set("");
    vi.runAllTimers();

    expect(label.value).toBe("");
    expect(readText()).toBe("");
    expect(el.querySelectorAll(".char-slot")).toHaveLength(0);
  });

  it("supports non-basic characters", () => {
    const label = slotText(el, "Copy!");

    label.set("✓");
    vi.runAllTimers();

    expect(label.value).toBe("✓");
    expect(el.querySelectorAll(".char-slot")).toHaveLength(1);
    expect(readText()).toBe("✓");
  });
});

// A revert window far longer than any roll animation, so we can settle the
// flash roll first and assert its DOM before the auto-revert fires.
const LONG_REVERT = 100000;
// Comfortably past the longest roll animation, but short of LONG_REVERT.
const SETTLE = 5000;

describe("flash()", () => {
  it("shows the flash text, then reverts to the original", () => {
    const label = slotText(el, "Copy");

    label.flash("Copied", { revertAfter: LONG_REVERT });
    expect(label.value).toBe("Copied");

    vi.advanceTimersByTime(SETTLE);
    expect(readText()).toBe("Copied");

    vi.advanceTimersByTime(LONG_REVERT);
    vi.runAllTimers();
    expect(label.value).toBe("Copy");
    expect(readText()).toBe("Copy");
  });

  it("reverts to the original after a burst of flashes", () => {
    const label = slotText(el, "Copy");

    label.flash("Copied", { revertAfter: LONG_REVERT });
    vi.advanceTimersByTime(400);
    label.flash("Copied!", { revertAfter: LONG_REVERT });
    expect(label.value).toBe("Copied!");

    vi.advanceTimersByTime(SETTLE);
    expect(readText()).toBe("Copied!");

    vi.advanceTimersByTime(LONG_REVERT);
    vi.runAllTimers();
    expect(label.value).toBe("Copy");
    expect(readText()).toBe("Copy");
  });

  it("is cancelled by an explicit set()", () => {
    const label = slotText(el, "Copy");

    label.flash("Copied", { revertAfter: 1000 });
    label.set("Done");
    vi.runAllTimers();

    expect(label.value).toBe("Done");
    expect(readText()).toBe("Done");
  });
});

describe("destroy()", () => {
  it("restores plain text and removes slot markup", () => {
    const label = slotText(el, "Copy");

    label.destroy();

    expect(el.classList.contains("slot-text")).toBe(false);
    expect(el.querySelectorAll(".char-slot")).toHaveLength(0);
    expect(el.textContent).toBe("Copy");
  });

  it("cancels a pending flash revert", () => {
    const label = slotText(el, "Copy");

    label.flash("Copied", { revertAfter: LONG_REVERT });
    vi.advanceTimersByTime(SETTLE);
    label.destroy();
    vi.runAllTimers();

    expect(el.classList.contains("slot-text")).toBe(false);
    expect(el.textContent).toBe("Copied");
  });
});
