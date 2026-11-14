import type { FormHiddenInputProps } from '@cocokits/machines/form-field';

/**
 * The strings the hidden native inputs of a form control carry, one input each. A control that renders them
 * (the Select, the Chip list) keeps its own `@for` block and reads the entries from here.
 *
 * @param formInput - What the machine says about the hidden inputs: the name, the facts and the values.
 * @param list - Whether the control holds a list of values (`multiple`, the Chip list). An empty list that is
 * required gets one empty input, so the browser blocks the submit.
 * @returns No entry while there is no `name`; else one string per hidden input.
 * @internal
 */
export function hiddenInputEntries(formInput: FormHiddenInputProps, list: boolean): readonly string[] {
  if (!formInput.name) return [];
  if (!list) return formInput.values;
  return formInput.values.length === 0 && formInput.required ? [''] : formInput.values;
}

/**
 * Handles the `invalid` event of a hidden input: a required, empty control blocks the submit. The event is never
 * canceled (a canceled `invalid` lets the submit go on). The browser focuses the invalid input right after the
 * event, so the control takes the focus now and again in the next task.
 *
 * @param event - The `invalid` event of the hidden input.
 * @param focus - Moves the focus to the control's visible element.
 * @returns The validation message of the browser.
 * @internal
 */
export function handleHiddenInputInvalid(event: Event, focus: () => void): string {
  focus();
  setTimeout(focus, 0);
  return (event.target as HTMLInputElement).validationMessage;
}
