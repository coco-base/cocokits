'use client';

import { createContext, useContext, type Context } from 'react';
import type {
  FormFieldControlState,
  FormFieldIds,
  FormFieldOwnFacts,
  FormFieldState,
} from '@cocokits/machines/form-field';

/** What a FormField gives its control: the ids, the facts the author set on the field, and the registration. */
export interface FormFieldContextValue {
  /** The ids derived from the field id; `label` is the id the Label renders, so an author id on the Label wins. */
  readonly ids: FormFieldIds;
  /** The facts the author set on the FormField. */
  readonly own: FormFieldOwnFacts;
  /**
   * Makes `token` the field's control when none is yet, and remembers its `element` so a click on the input
   * wrapper can focus it. Call it in a layout effect; the first control to claim is the field's control for
   * as long as it is mounted, and no later control takes over.
   *
   * @returns Whether `token` is the field's control.
   */
  readonly claim: (token: object, element: HTMLElement) => boolean;
  /** Releases the claim of `token` when it holds it, and forgets what it reported. */
  readonly release: (token: object) => void;
  /** Tells the field the `id` an author gave the Label (`undefined` again when it goes); a control names itself by it. */
  readonly setLabelId: (id: string | undefined) => void;
  /** Gives the field the control's state. Ignored unless `token` holds the claim. */
  readonly report: (token: object, state: FormFieldControlState) => void;
  /**
   * The input wrapper element: the box an overlay of the field's control (the Select) lines up with. `null`
   * until the first commit.
   */
  readonly inputWrapper: HTMLElement | null;
}

/** What a FormField gives its Label: whether to show the required marker and which `for` to render. */
export interface FormFieldLabelContextValue {
  /** The field's effective `required`: the field's own or the control's. */
  readonly required: boolean;
  /** Hides the marker; the field's `hideRequiredMarker`. */
  readonly hideRequiredMarker: boolean;
  /**
   * The `for` to render without an explicit one: the id the registered control reported; before the first
   * client commit settled, the generated control id; afterwards nothing while no CocoKits control is in the field.
   */
  readonly controlId: string | undefined;
}

/** Context of the control and its registration. `null` outside a FormField. */
export const FormFieldContext: Context<FormFieldContextValue | null> = createContext<FormFieldContextValue | null>(
  null,
);

/**
 * Context of the field's resolved state, for the parts that read the field's facts (the FieldError). It is
 * separate from the control's context so that the control does not render again on its own report.
 * `null` outside a FormField.
 */
export const FormFieldStateContext: Context<FormFieldState | null> = createContext<FormFieldState | null>(null);

/** Context of the facts for the Label. `null` outside a FormField. */
export const FormFieldLabelContext: Context<FormFieldLabelContextValue | null> =
  createContext<FormFieldLabelContextValue | null>(null);

/** @returns The field's context for a control, or `null` outside a FormField. */
export function useFormFieldContext(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

/** @returns The field's context for a Label, or `null` outside a FormField. */
export function useFormFieldLabelContext(): FormFieldLabelContextValue | null {
  return useContext(FormFieldLabelContext);
}

/** @returns The field's resolved state, or `null` outside a FormField. */
export function useFormFieldState(): FormFieldState | null {
  return useContext(FormFieldStateContext);
}
