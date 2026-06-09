import "slot-text/style.css";
import { useState } from "react";
import { chromatic } from "slot-text";
import { SlotText } from "slot-text/react";

export function CopyButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      <SlotText
        text={copied ? "Copied" : "Copy"}
        options={{
          direction: copied ? "up" : "down",
          skipUnchanged: false,
          color: copied ? chromatic({ from: 190 }) : undefined,
        }}
      />
    </button>
  );
}
