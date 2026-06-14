<script lang="ts">
  import "slot-text/style.css";
  import { chromatic } from "slot-text";
  import { slotText } from "slot-text/svelte";

  let copied = false;

  function copy() {
    copied = true;
    window.setTimeout(() => {
      copied = false;
    }, 1400);
  }
</script>

<button type="button" aria-label={copied ? "Copied" : "Copy"} on:click={copy}>
  <span
    use:slotText={{
      text: copied ? "Copied" : "Copy",
      options: {
        direction: copied ? "up" : "down",
        skipUnchanged: false,
        color: copied ? chromatic({ from: 190 }) : undefined,
      },
    }}
  ></span>
</button>
