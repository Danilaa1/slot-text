import { createRenderEffect, onCleanup, type Accessor } from "solid-js";
import { slotText as createSlotText, type SlotOptions } from "./index.js";

export interface SlotTextParams {
  text: string;
  options?: SlotOptions;
}

export function slotText(element: HTMLElement, accessor: Accessor<SlotTextParams>) {
  const initial = accessor();
  const controller = createSlotText(element, initial.text, initial.options);
  let previousText = initial.text;
  let isFirstRun = true;

  createRenderEffect(() => {
    const next = accessor();

    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    if (next.text !== previousText) {
      previousText = next.text;
      controller.set(next.text, next.options);
    }
  });

  onCleanup(() => {
    controller.destroy();
  });
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      slotText: SlotTextParams;
    }
  }
}
