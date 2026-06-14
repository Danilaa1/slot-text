import { slotText as createSlotText, type SlotOptions } from "./index.js";

export interface SlotTextParams {
  text: string;
  options?: SlotOptions;
}

export function slotText(element: HTMLElement, params: SlotTextParams) {
  const controller = createSlotText(element, params.text, params.options);
  let previousText = params.text;

  return {
    update(params: SlotTextParams) {
      if (params.text === previousText) return;
      previousText = params.text;
      controller.set(params.text, params.options);
    },
    destroy() {
      controller.destroy();
    },
  };
}
