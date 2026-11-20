/** The part of a DOM click event the link guard uses. */
export interface ButtonClickEvent {
  /** Whether a handler already vetoed the event. */
  readonly defaultPrevented: boolean;
  /** Cancels the link navigation. */
  preventDefault(): void;
  /** Stops the remaining listeners on the same element. */
  stopImmediatePropagation(): void;
}

/** Inputs of `getButtonProps`. */
export interface ButtonProps {
  /**
   * Whether the button is disabled. A `<button>` gets native `disabled`; an `<a>` gets
   * `aria-disabled`, `tabindex="-1"` and a click guard.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /** The host element the adapter renders on. It decides how a disabled state is expressed. */
  readonly element: 'button' | 'a';
}

/** Props of the root part. Absent keys are not rendered. */
export interface ButtonRootProps {
  /** The `cck-button` block class. */
  readonly class: string;
  /** Native `disabled`; present on a disabled `<button>` only. */
  readonly disabled?: true;
  /** Present on a disabled `<a>` only. */
  readonly 'aria-disabled'?: 'true';
  /** Takes a disabled `<a>` out of the tab order. */
  readonly tabindex?: -1;
  /** Present (empty) when disabled, on both elements. */
  readonly 'data-disabled'?: '' | undefined;
  /**
   * Present on a disabled link only. An adapter runs it before any other click listener of the host
   * (the capture phase), after a consumer handler that may veto with `preventDefault()`.
   */
  readonly onClick?: (event: ButtonClickEvent) => void;
}
