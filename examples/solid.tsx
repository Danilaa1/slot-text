import { createSignal } from "solid-js";
import "slot-text/style.css";
import { chromatic } from "slot-text";
import { slotText } from "slot-text/solid";

void slotText;

export function CopyButton() {
  const [copied, setCopied] = createSignal(false);

  function copy() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button type="button" aria-label={copied() ? "Copied" : "Copy"} onClick={copy}>
      <span
        use:slotText={{
          text: copied() ? "Copied" : "Copy",
          options: {
            direction: copied() ? "up" : "down",
            skipUnchanged: false,
            color: copied() ? chromatic({ from: 190 }) : undefined,
          },
        }}
      />
    </button>
  );
}
