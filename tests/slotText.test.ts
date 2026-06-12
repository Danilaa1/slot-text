import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { slotText } from "../src/index.js";

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
