import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, } from "react";
import { animateSlotText, buildSlotText, clearSlotText, } from "./slotText.js";
export const SlotText = forwardRef(({ text, options, "aria-label": ariaLabel, ...props }, forwardedRef) => {
    const elementRef = useRef(null);
    const mountedRef = useRef(false);
    const firstTextEffectRef = useRef(true);
    const optionsRef = useRef(options);
    useImperativeHandle(forwardedRef, () => elementRef.current, []);
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        buildSlotText(element, text);
        mountedRef.current = true;
        return () => {
            clearSlotText(element);
            mountedRef.current = false;
            firstTextEffectRef.current = true;
        };
    }, []);
    useEffect(() => {
        const element = elementRef.current;
        if (!element || !mountedRef.current)
            return;
        if (firstTextEffectRef.current) {
            firstTextEffectRef.current = false;
            return;
        }
        animateSlotText(element, text, optionsRef.current);
    }, [text]);
    return createElement("span", {
        ...props,
        "aria-label": ariaLabel ?? text,
        ref: elementRef,
    });
});
SlotText.displayName = "SlotText";
