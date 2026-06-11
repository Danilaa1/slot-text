import { type HTMLAttributes } from "react";
import { type SlotOptions } from "./slotText.js";
export interface SlotTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    text: string;
    options?: SlotOptions;
}
export declare const SlotText: import("react").ForwardRefExoticComponent<SlotTextProps & import("react").RefAttributes<HTMLSpanElement>>;
