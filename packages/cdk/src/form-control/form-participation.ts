import { watchFieldsetDisabled } from './fieldset-disabled';

/** Options shared by both modes of {@link createFormParticipation}. */
export interface FormParticipationBaseOptions {
  /** Called after a reset of the owner form that nobody canceled, once the browser has reset the element. */
  readonly onReset?: ((event: Event) => void) | undefined;
  /** Called with whether an ancestor fieldset disables the element. It runs once after creation, then on each change. */
  readonly onFieldsetDisabledChange?: ((disabled: boolean) => void) | undefined;
  /**
   * Called with `true` on every `submit` event of the owner form, canceled ones included.
   * Called with `false` after a reset that nobody canceled.
   */
  readonly onSubmittedChange?: ((submitted: boolean) => void) | undefined;
}

/** Text mode: `syncValue()` writes the `value` of the element. */
export interface FormParticipationTextOptions extends FormParticipationBaseOptions {
  /**
   * The native text control, after it is in the document.
   * A `button` also works, as the trigger of a custom control.
   *
   * A button takes part in the reset, the submit attempt and the disabling fieldset. Its own `value` is left alone when `getValue` returns it.
   */
  readonly element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;
  /** Returns the value the element should show. It is read on every sync. */
  readonly getValue: () => string;
  /** Not used in text mode. Leave it out; it is the key that tells the two modes apart. */
  readonly getChecked?: undefined;
}

/** Checked mode: `syncValue()` writes the `checked` state of the element. */
export interface FormParticipationCheckedOptions extends FormParticipationBaseOptions {
  /** The native checkbox or radio, after it is in the document. */
  readonly element: HTMLInputElement;
  /** Returns the checked state the element should show. It is read on every sync. */
  readonly getChecked: () => boolean;
  /** Not used in checked mode. Leave it out; it is the key that tells the two modes apart. */
  readonly getValue?: undefined;
  /**
   * For a radio. Called with the `change` event when the user checks another radio of the same group, so this one is now unchecked.
   * The group has the same non-empty `name`, the same form owner and the same root node.
   */
  readonly onUncheckedByGroup?: ((event: Event) => void) | undefined;
}

/** Options of {@link createFormParticipation}. */
export type FormParticipationOptions = FormParticipationTextOptions | FormParticipationCheckedOptions;

/** The handle {@link createFormParticipation} returns. */
export interface FormParticipation {
  /** Writes the result of `getValue()` or `getChecked()` to the element when it differs. After `destroy()` it does nothing. */
  syncValue(): void;
  /** Removes every listener and observer. Calling it again does nothing. */
  destroy(): void;
}

/**
 * Lets a native text, checkbox or radio control take part in its form. It reports a reset, a submit attempt
 * and a disabling fieldset, and it writes your value to the element (`value` or `checked`).
 *
 * @remarks
 * The form is read when the event happens, so a change of the `form` attribute or a move needs no new setup.
 *
 * A reset is reported in a later task, after the browser has reset the element and every listener has run.
 * A canceled reset reports nothing.
 *
 * In checked mode it also reports a radio that another radio of its group unchecked. It listens for `change`
 * on the root node of the radio, which is the document or its shadow root, because `change` is not composed.
 *
 * Call it after the element is in the document. It touches no DOM when imported.
 *
 * @param options - The element, how to read the value, and the callbacks.
 * @returns The handle. Call `destroy()` when the element goes away.
 * @example
 * const input = document.querySelector<HTMLInputElement>('input[name="colour"]')!;
 * let value = 'red';
 * const participation = createFormParticipation({
 *   element: input,
 *   getValue: () => value,
 *   onReset: () => {
 *     value = input.defaultValue;
 *   },
 * });
 * participation.syncValue();
 * // When the element goes away:
 * participation.destroy();
 */
export function createFormParticipation(options: FormParticipationOptions): FormParticipation {
  const { element } = options;
  const doc = element.ownerDocument;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let destroyed = false;

  const syncValue = (): void => {
    if (destroyed) return;
    if (options.getChecked === undefined) {
      const value = options.getValue();
      if (options.element.value !== value) options.element.value = value;
    } else {
      const checked = options.getChecked();
      if (options.element.checked !== checked) options.element.checked = checked;
    }
  };

  const ownedBy = (event: Event): boolean => event.target !== null && event.target === element.form;

  const onResetEvent = (event: Event): void => {
    if (!ownedBy(event)) return;
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (destroyed || event.defaultPrevented) return;
      options.onSubmittedChange?.(false);
      options.onReset?.(event);
      syncValue();
    }, 0);
    timers.add(timer);
  };

  const onSubmitEvent = (event: Event): void => {
    if (ownedBy(event)) options.onSubmittedChange?.(true);
  };

  // Capture on the document: a listener that stops propagation cannot hide the event.
  doc.addEventListener('reset', onResetEvent, true);
  doc.addEventListener('submit', onSubmitEvent, true);
  const stopFieldsetWatch =
    options.onFieldsetDisabledChange === undefined
      ? undefined
      : watchFieldsetDisabled(element, options.onFieldsetDisabledChange);

  const root = element.getRootNode();
  const onChangeEvent = (event: Event): void => {
    if (options.getChecked === undefined) return;
    const { element: radio, onUncheckedByGroup } = options;
    const target = event.target as HTMLInputElement | null;
    if (target === null || target === radio || target.localName !== 'input') return;
    if (target.type !== 'radio' || !target.checked || radio.checked) return;
    if (radio.type !== 'radio' || radio.name === '' || target.name !== radio.name) return;
    if (target.form !== radio.form || target.getRootNode() !== radio.getRootNode()) return;
    onUncheckedByGroup?.(event);
  };
  const watchGroup = options.getChecked !== undefined && options.onUncheckedByGroup !== undefined;
  if (watchGroup) root.addEventListener('change', onChangeEvent, true);

  return {
    syncValue,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      doc.removeEventListener('reset', onResetEvent, true);
      doc.removeEventListener('submit', onSubmitEvent, true);
      if (watchGroup) root.removeEventListener('change', onChangeEvent, true);
      stopFieldsetWatch?.();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    },
  };
}
