<script setup lang="ts">
import "slot-text/style.css";
import { ref } from "vue";
import { chromatic } from "slot-text";
import { SlotText } from "slot-text/vue";

const copied = ref(false);

function copy() {
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1400);
}
</script>

<template>
  <button type="button" @click="copy">
    <SlotText
      :text="copied ? 'Copied' : 'Copy'"
      :options="{
        direction: copied ? 'up' : 'down',
        skipUnchanged: false,
        color: copied ? chromatic({ from: 190 }) : undefined,
      }"
    />
  </button>
</template>
