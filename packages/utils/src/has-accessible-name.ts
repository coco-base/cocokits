/** The part of a native form control that {@link hasAccessibleName} reads. Any `HTMLInputElement` fits. */
export interface NameableElement {
  /** The labels that name the control, which are the `<label for>` and a wrapping `<label>`. */
  readonly labels?: { readonly length: number } | null;
  /**
   * Whether the attribute is present.
   * @param name - The attribute name.
   * @returns `true` when the element has the attribute.
   */
  hasAttribute(name: string): boolean;
}

/**
 * Checks whether a native form control has something that names it. A name source is a label, `aria-label`,
 * `aria-labelledby` or `title`. A label is a `<label for>` or a wrapping `<label>`, found through `element.labels`.
 *
 * @remarks
 * It checks that a name source exists. It does not check that the source has text or that it points to a real element.
 * Use it in a development check, after the control is in the document.
 *
 * @param element - The control, in a document.
 * @returns `true` when at least one name source is present.
 * @example
 * const input = document.querySelector<HTMLInputElement>('input')!;
 * if (!hasAccessibleName(input)) console.warn('This input has no accessible name.');
 */
export function hasAccessibleName(element: NameableElement): boolean {
  return (
    (element.labels?.length ?? 0) > 0 ||
    ['aria-label', 'aria-labelledby', 'title'].some((attribute) => element.hasAttribute(attribute))
  );
}

/** What {@link hasChoiceControlName} reads of the label that a choice control renders. */
export interface ChoiceLabelPart {
  /** The nodes in the label. They are the content you wrote, and they can include decoration such as a switch track. */
  readonly childNodes: ArrayLike<unknown>;
}

/**
 * Checks whether a checkbox, a switch or a radio has something that names it.
 * The control always renders its own `<label for>`, so that label counts only when it holds content.
 *
 * @remarks
 * Other name sources are the same as in {@link hasAccessibleName}: another label, `aria-label`, `aria-labelledby` and `title`.
 *
 * Use it in a development check, after the input is in the document.
 *
 * @param input - The native input, in a document.
 * @param label - The label that the control renders.
 * @param ignoredLabelNodes - Nodes of the label that are decoration and not your content, such as a switch track.
 * @returns `true` when the label has content or another name source exists.
 * @example
 * const input = document.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
 * const label = document.querySelector<HTMLLabelElement>(`label[for="${input.id}"]`)!;
 * const named = hasChoiceControlName(input, label);
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
