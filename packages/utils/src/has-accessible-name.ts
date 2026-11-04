/** The part of a native form control that {@link hasAccessibleName} reads; any `HTMLInputElement` fits. */
export interface NameableElement {
  /** The labels that name the control (`<label for>` and a wrapping `<label>`). */
  readonly labels?: { readonly length: number } | null;
  /** Whether the attribute is present. */
  hasAttribute(name: string): boolean;
}

/**
 * Whether a native form control has something that names it: a label (`<label for>` or a wrapping
 * `<label>`, through `element.labels`), `aria-label`, `aria-labelledby` or `title`. It checks that a
 * name source exists, not that it is non-empty or resolves. Use it in a development check after mount.
 *
 * @param element - The control, mounted in a document.
 * @returns `true` when at least one name source is present.
 */
export function hasAccessibleName(element: NameableElement): boolean {
  return (
    (element.labels?.length ?? 0) > 0 ||
    ['aria-label', 'aria-labelledby', 'title'].some((attribute) => element.hasAttribute(attribute))
  );
}

/** What {@link hasChoiceControlName} reads of the label part that every choice control renders. */
export interface ChoiceLabelPart {
  /** The nodes in the label: the author's content, and for a Switch its track too. */
  readonly childNodes: ArrayLike<unknown>;
}

/**
 * Whether a checkbox, switch or radio has something that names it. A choice control always renders its own
 * `<label for>`, so that label counts only when it holds content; the name sources are then the same as in
 * {@link hasAccessibleName} (another label, `aria-label`, `aria-labelledby`, `title`), `title` included. A
 * framework whose input cannot carry `title` simply never meets that source. Use it in a development check
 * after mount.
 *
 * @param input - The native input, mounted in a document.
 * @param label - The control's own label part.
 * @param ignoredLabelNodes - Nodes of the label that are not the author's content (the Switch's track).
 * @returns `true` when the label has content or another name source exists.
 */
export function hasChoiceControlName(
  input: NameableElement,
  label: ChoiceLabelPart,
  ignoredLabelNodes: readonly unknown[] = [],
): boolean {
  if (Array.from(label.childNodes).some((node) => !ignoredLabelNodes.includes(node))) return true;
  const otherLabels = Math.max((input.labels?.length ?? 0) - 1, 0);
  return hasAccessibleName({ labels: { length: otherLabels }, hasAttribute: (name) => input.hasAttribute(name) });
}
