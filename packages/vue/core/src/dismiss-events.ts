/**
 * The cancelable event a content emits when a press lands outside it (`pointerDownOutside`, and `interactOutside`
 * after it). Call `preventDefault()`, or write `.prevent` on the listener, to keep the overlay open. The press is
 * `detail.originalEvent`.
 */
export type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

/**
 * The cancelable event a content emits when focus moves outside it (`focusOutside`, and `interactOutside` after
 * it). Call `preventDefault()`, or write `.prevent` on the listener, to keep the overlay open. The focus event is
 * `detail.originalEvent`.
 */
export type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
