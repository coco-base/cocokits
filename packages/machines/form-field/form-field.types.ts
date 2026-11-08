/** Props of one FormField part. */
export interface FormFieldPartProps {
  /** The part's class from the anatomy: `cck-form-field` on the root, `cck-form-field__<part>` on the others. */
  readonly class: string;
}

/** The resolved facts of a field: what the root renders. */
export interface FormFieldState {
  /** Disabled by the field, the control, a forms library or an ancestor fieldset. */
  readonly disabled: boolean;
  /** Read-only by the field or the control. */
  readonly readOnly: boolean;
  /** Required by the field or the control. */
  readonly required: boolean;
  /** Invalid by the field or the control (the raw fact, before the `touched` or `submitted` gate). */
  readonly invalid: boolean;
  /** The control is waiting for an asynchronous validator. */
  readonly pending: boolean;
  /** The user left the control. */
  readonly touched: boolean;
  /** The user edited the control. */
  readonly dirty: boolean;
  /** A submit of the owner form was attempted. */
  readonly submitted: boolean;
  /** The control has focus. */
  readonly focused: boolean;
  /** The control has a value. */
  readonly filled: boolean;
  /** The control is hidden. */
  readonly hidden: boolean;
}

/** The facts a field has of its own, set on the FormField by its author. */
export interface FormFieldOwnFacts {
  /** The field disables its control. */
  readonly disabled?: boolean | undefined;
  /** The field makes its control read-only. */
  readonly readOnly?: boolean | undefined;
  /** The field makes its control required. */
  readonly required?: boolean | undefined;
  /** The field marks its control invalid. */
  readonly invalid?: boolean | undefined;
  /** Hides the required marker of the Label. It does not change `required`. */
  readonly hideRequiredMarker?: boolean | undefined;
}

/** What a control reports to its field: its effective id and its facts. A missing fact is `false`. */
export interface FormFieldControlState {
  /** The effective id of the control: the author's `id` or the generated one. */
  readonly id?: string | undefined;
  /** See {@link FormFieldState.disabled}. */
  readonly disabled?: boolean | undefined;
  /** See {@link FormFieldState.readOnly}. */
  readonly readOnly?: boolean | undefined;
  /** See {@link FormFieldState.required}. */
  readonly required?: boolean | undefined;
  /** See {@link FormFieldState.invalid}. */
  readonly invalid?: boolean | undefined;
  /** See {@link FormFieldState.pending}. */
  readonly pending?: boolean | undefined;
  /** See {@link FormFieldState.touched}. */
  readonly touched?: boolean | undefined;
  /** See {@link FormFieldState.dirty}. */
  readonly dirty?: boolean | undefined;
  /** See {@link FormFieldState.submitted}. */
  readonly submitted?: boolean | undefined;
  /** See {@link FormFieldState.focused}. */
  readonly focused?: boolean | undefined;
  /** See {@link FormFieldState.filled}. */
  readonly filled?: boolean | undefined;
  /** See {@link FormFieldState.hidden}. */
  readonly hidden?: boolean | undefined;
}

/** The author's ids of the hints and of the errors a field holds, in document order; `undefined` means none. */
export interface FormFieldPartIds {
  /** One entry per Hint, in document order. */
  readonly hints?: readonly (string | undefined)[] | undefined;
  /** One entry per FieldError, in document order. */
  readonly errors?: readonly (string | undefined)[] | undefined;
}

/** The ids derived from one field id. */
export interface FormFieldIds {
  /** The id of the control: `<fieldId>-control`. */
  readonly control: string;
  /** The id of the feedback wrapper: `<fieldId>-feedback`. */
  readonly feedback: string;
  /** The id of the Label: `<fieldId>-label`. A control without its own name falls back to it. */
  readonly label: string;
  /** The ids of the field's hints in document order: the author's `id`, or `<fieldId>-hint-<n>`. */
  readonly hints?: readonly string[] | undefined;
  /** The ids of the field's errors in document order: the author's `id`, or `<fieldId>-error-<n>`. */
  readonly errors?: readonly string[] | undefined;
}

/** Input of `getFormFieldProps`. Both parts are optional so a field without a control renders as before. */
export interface FormFieldProps {
  /** The resolved facts, from `resolveFormFieldState`. */
  readonly state?: FormFieldState | undefined;
  /** The field id; the feedback wrapper gets `<fieldId>-feedback`. */
  readonly fieldId?: string | undefined;
}

/** Props of the root part. Absent keys are not rendered. */
export interface FormFieldRootProps extends FormFieldPartProps {
  /** Native `hidden`, present while the control is hidden. */
  readonly hidden?: true | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-readonly'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-required'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-invalid'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-pending'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-touched'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-dirty'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-submitted'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-focused'?: '' | undefined;
  /** Present (empty) while the fact is true. */
  readonly 'data-filled'?: '' | undefined;
}

/** Props of the feedback wrapper. */
export interface FormFieldFeedbackWrapperProps extends FormFieldPartProps {
  /** `<fieldId>-feedback`, present when the field id is known. */
  readonly id?: string | undefined;
}

/** What `getFormFieldProps` returns. */
export interface FormFieldParts {
  /** The root props. */
  readonly root: FormFieldRootProps;
  /** The props of the part around the control zone. */
  readonly wrapper: FormFieldPartProps;
  /** The props of the part that holds the control. */
  readonly inputWrapper: FormFieldPartProps;
  /** The props of the part that holds the hints. */
  readonly feedbackWrapper: FormFieldFeedbackWrapperProps;
}
