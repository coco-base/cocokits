import { watchFieldsetDisabled } from './fieldset-disabled';

/** Options shared by both modes of {@link createFormParticipation}. */
export interface FormParticipationBaseOptions {
  /** Called after an uncanceled reset of the owner form, once the browser has reset the element. */
  readonly onReset?: ((event: Event) => void) | undefined;
  /** Called with whether an ancestor fieldset disables the element; once after creation, then on change. */
  readonly onFieldsetDisabledChange?: ((disabled: boolean) => void) | undefined;
  /** Called with `true` on every `submit` event of the owner form (canceled ones included), and with `false` after an uncanceled reset. */
  readonly onSubmittedChange?: ((submitted: boolean) => void) | undefined;
}

/** Text mode: `syncValue()` writes `.value`. */
export interface FormParticipationTextOptions extends FormParticipationBaseOptions {
  /**
   * The native text control, after mount. A `button` (the trigger of a custom control such as the Select)
   * takes part for the reset, the submit attempt and the disabling fieldset; its own `value` is left alone if
   * `getValue` returns it.
   */
  readonly element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;
  /** The model value as the DOM should show it; read on every sync. */
  readonly getValue: () => string;
  readonly getChecked?: undefined;
}

/** Checked mode: `syncValue()` writes `.checked`. */
export interface FormParticipationCheckedOptions extends FormParticipationBaseOptions {
  /** The native checkbox or radio, after mount. */
  readonly element: HTMLInputElement;
  /** The model's checked state as the DOM should show it; read on every sync. */
  readonly getChecked: () => boolean;
  readonly getValue?: undefined;
  /**
   * Radio: called with the `change` event when the user checked another radio of the same group
   * (same non-empty `name`, form owner and root node) and this element is now unchecked.
   */
  readonly onUncheckedByGroup?: ((event: Event) => void) | undefined;
}

/** Options of {@link createFormParticipation}. */
export type FormParticipationOptions = FormParticipationTextOptions | FormParticipationCheckedOptions;

/** The handle {@link createFormParticipation} returns. */
export interface FormParticipation {
  /** Writes `getValue()` (or `getChecked()`) to the element when the two differ. Does nothing after `destroy()`. */
  syncValue(): void;
  /** Removes every listener and observer; idempotent. */
  destroy(): void;
}

/**
 * Lets a native text, checkbox or radio control take part in its owner form: reports a reset, a submit attempt and a
 * disabling fieldset, and writes the model value (`value` or `checked`) to the element. In checked mode it also reports
 * a radio that another radio of its group unchecked, from a `change` listener on the radio's root node (the
 * document or its shadow root; `change` is not composed). The owner is read when the event
 * happens, so a change of the `form` attribute or a move needs no re-setup. A reset is reported
 * in a later task, after the browser has reset the element and every listener has run, so
 * a canceled reset reports nothing. Create it after mount; it touches no DOM at import.
 *
 * @param options - The element and the callbacks.
 * @returns The handle; call `destroy()` when the element goes away.
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
