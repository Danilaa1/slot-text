import { type PropType } from "vue";
import { type SlotOptions } from "./slotText";
export declare const SlotText: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    text: {
        type: StringConstructor;
        required: true;
    };
    options: {
        type: PropType<SlotOptions>;
        default: undefined;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    text: {
        type: StringConstructor;
        required: true;
    };
    options: {
        type: PropType<SlotOptions>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    options: SlotOptions;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
