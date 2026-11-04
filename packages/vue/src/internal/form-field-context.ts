import { inject, type ComputedRef, type InjectionKey, type ShallowRef } from 'vue';
import type {
  FormFieldControlState,
  FormFieldIds,
  FormFieldOwnFacts,
  FormFieldState,
} from '@cocokits/machines/form-field';

/** What a FormField gives its control: the ids, the facts the author set on the field, and the registration. */
export interface FormFieldContextValue {
  /** The ids derived from the field id. */
  readonly ids: ComputedRef<FormFieldIds>;
  /** The facts the author set on the FormField. */
  readonly own: ComputedRef<FormFieldOwnFacts>;
  /**
   * Makes `token` the field's control when none is yet, and remembers its `element` so a click on the input
   * wrapper can focus it. Call it after mount; the first control to claim is the field's control for as long as
   * it is mounted, and no later control takes over.
   *
   * @returns Whether `token` is the field's control.
   */
  readonly claim: (token: object, element: HTMLElement) => boolean;
  /** Releases the claim of `token` when it holds it, and forgets what it reported. */
  readonly release: (token: object) => void;
  /** Gives the field the control's state. Ignored unless `token` holds the claim. */
  readonly report: (token: object, state: FormFieldControlState) => void;
  /**
   * The input wrapper element: the box an overlay of the field's control (the Select) lines up with. `null`
   * until the field has mounted.
   */
  readonly inputWrapper: ShallowRef<HTMLElement | null>;
}

/** What a FormField gives its Label: whether to show the required marker and which `for` to render. */
export interface FormFieldLabelContextValue {
  /** The field's effective `required`: the field's own or the control's. */
  readonly required: ComputedRef<boolean>;
  /** Hides the marker; the field's `hideRequiredMarker`. */
  readonly hideRequiredMarker: ComputedRef<boolean>;
  /**
   * The `for` to render without an explicit one: the id the registered control reported; before the field
   * mounted, the generated control id; afterwards nothing while no CocoKits control is in the field.
   */
  readonly controlId: ComputedRef<string | undefined>;
  /**
   * The `id` the author wrote on the Label. The field's `ids.label` follows it, so the parts that name
   * themselves by the label (the Select list) point at the element that exists.
   */
  readonly authorId: ShallowRef<string | undefined>;
}

/** Injection key of the control context. Not exported from any entry point. */
export const FORM_FIELD_KEY: InjectionKey<FormFieldContextValue> = Symbol('cck-form-field');

/**
 * Injection key of the field's resolved state, for the parts that read the field's facts (the FieldError).
 * It is separate from the control's context so that the control does not render again on its own report.
 * Not exported from any entry point.
 */
export const FORM_FIELD_STATE_KEY: InjectionKey<ComputedRef<FormFieldState>> = Symbol('cck-form-field-state');

/** Injection key of the Label context. Not exported from any entry point. */
export const FORM_FIELD_LABEL_KEY: InjectionKey<FormFieldLabelContextValue> = Symbol('cck-form-field-label');

/** @returns The text, or `undefined` for `undefined` and `''`: an empty `id` or `for` counts as none. */
export function nonEmpty(text: string | undefined): string | undefined {
  return text === '' ? undefined : text;
}

/** @returns The field's context for a control, or `undefined` outside a FormField. */
export function useFormFieldContext(): FormFieldContextValue | undefined {
  return inject(FORM_FIELD_KEY, undefined);
}

/** @returns The field's context for a Label, or `undefined` outside a FormField. */
export function useFormFieldLabelContext(): FormFieldLabelContextValue | undefined {
  return inject(FORM_FIELD_LABEL_KEY, undefined);
}

/** @returns The field's resolved state, or `undefined` outside a FormField. */
export function useFormFieldState(): ComputedRef<FormFieldState> | undefined {
  return inject(FORM_FIELD_STATE_KEY, undefined);
}
