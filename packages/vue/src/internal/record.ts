/** A copy of the record without the given keys. */
export function omit(record: object, ...keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(key)));
}

/** The given keys of the record that are set; a key whose value is `undefined` is dropped, so no empty attribute renders. */
export function pick(record: object, ...keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([key, value]) => keys.includes(key) && value !== undefined));
}

/**
 * The declared props of a choice control that are attributes of its input: `aria-label`, `aria-labelledby`,
 * `aria-describedby` and `value`. A prop that is not set stays `undefined` and renders nothing.
 */
export function declaredInputAttrs(props: {
  readonly ariaLabel?: string | undefined;
  readonly ariaLabelledby?: string | undefined;
  readonly ariaDescribedby?: string | undefined;
  readonly value?: string | undefined;
}): Record<string, unknown> {
  return {
    'aria-label': props.ariaLabel,
    'aria-labelledby': props.ariaLabelledby,
    'aria-describedby': props.ariaDescribedby,
    value: props.value,
  };
}
