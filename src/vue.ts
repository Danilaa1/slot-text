import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import {
  animateSlotText,
  buildSlotText,
  clearSlotText,
  type SlotOptions,
} from "./slotText";

export const SlotText = defineComponent({
  name: "SlotText",
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      required: true,
    },
    options: {
      type: Object as PropType<SlotOptions>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const element = ref<HTMLElement | null>(null);
    let mounted = false;

    onMounted(() => {
      if (!element.value) return;
      buildSlotText(element.value, props.text);
      mounted = true;
    });

    watch(
      () => props.text,
      (text) => {
        if (!element.value || !mounted) return;
        animateSlotText(element.value, text, props.options);
      },
    );

    onBeforeUnmount(() => {
      if (!element.value) return;
      clearSlotText(element.value);
      mounted = false;
    });

    return () =>
      h("span", {
        ...attrs,
        "aria-label": attrs["aria-label"] ?? props.text,
        ref: element,
      });
  },
});
