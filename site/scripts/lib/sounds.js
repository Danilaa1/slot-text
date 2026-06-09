import { defineSound } from "https://esm.sh/@web-kits/audio@0.1.0";

/** Soft click for buttons and toggles. */
export const tick = defineSound({
  source: { type: "sine", frequency: { start: 400, end: 150 } },
  envelope: { decay: 0.05 },
  gain: 0.25,
});

/** Brighter blip for tab switches. */
export const blip = defineSound({
  source: { type: "triangle", frequency: { start: 600, end: 880 } },
  envelope: { decay: 0.07 },
  gain: 0.18,
});

/** Rising chime for successful copy. */
export const chime = defineSound({
  source: { type: "sine", frequency: { start: 520, end: 1040 } },
  envelope: { decay: 0.18 },
  gain: 0.22,
});
