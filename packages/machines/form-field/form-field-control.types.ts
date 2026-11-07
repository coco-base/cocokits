import type { FormFieldControlState, FormFieldIds, FormFieldOwnFacts, FormFieldRootProps } from './form-field.types';

/**
 * Inputs of `getFormFieldControlProps`: what every form-field control takes from its author and from the
 * facts its adapter tracks. A missing fact is `false`. The Input and the Textarea extend it.
 */
export interface FormFieldControlProps {
  /** The author's `id`. It wins over the generated control id. */
  readonly id?: string | undefined;
  /** The author's `aria-describedby`. The feedback id is added after it inside a field. */
  readonly ariaDescribedBy?: string | undefined;
  /** The author's `name` (or the one a forms library wrote). An empty string counts as none. */
  readonly name?: string | undefined;
  /**
   * The bound forms control's full path, used to default `name` when no author
   * `name` is set: the segments joined with `.`. No default for an empty path, an empty segment or a lone
   * numeric segment (a root array index).
   */
  readonly controlPath?: readonly (string | number)[] | null | undefined;
  /** Disabled by a prop, a forms library or an ancestor fieldset. */
  readonly disabled?: boolean | undefined;
  /** Read-only. */
  readonly readOnly?: boolean | undefined;
  /** Required. */
  readonly required?: boolean | undefined;
  /** Invalid. Rendered raw as `data-invalid`; `aria-invalid` waits for `touched` or `submitted`. */
  readonly invalid?: boolean | undefined;
  /** An asynchronous validator is running. */
  readonly pending?: boolean | undefined;
  /** The user left the control. */
  readonly touched?: boolean | undefined;
  /** The user edited the control. */
  readonly dirty?: boolean | undefined;
  /** A submit of the owner form was attempted. */
  readonly submitted?: boolean | undefined;
  /** The control has focus. */
  readonly focused?: boolean | undefined;
  /** Hidden. */
  readonly hidden?: boolean | undefined;
  /** The control has a value. The control works it out from its own value type. */
  readonly filled?: boolean | undefined;
}

/** What the enclosing FormField gives a control. Leave it out outside a field. */
export interface FormFieldControlContext {
  /**
   * The ids of the field. Leave them out for a second control in one field: it gets no generated id and no
   * feedback id.
   */
  readonly ids?: FormFieldIds | undefined;
  /** The facts the author set on the FormField; they reach the control by OR. */
  readonly state?: FormFieldOwnFacts | undefined;
}

/**
 * Props every form-field control renders on its root: the facts of the field root, the ids and the native
 * state. There is no `class`: each control adds its own (and the Input its `type`).
 */
export interface FormFieldControlRootProps extends Omit<FormFieldRootProps, 'class'> {
  /** The author's id, or the control id inside a field. */
  readonly id?: string | undefined;
  /** The author's name, or the joined control path. */
  readonly name?: string | undefined;
  /** Native `disabled`. */
  readonly disabled?: true | undefined;
  /** Native `readonly`. */
  readonly readonly?: true | undefined;
  /** Native `required`. */
  readonly required?: true | undefined;
  /** `'true'` only while invalid and (touched or submitted). Never `'false'`. */
  readonly 'aria-invalid'?: 'true' | undefined;
  /** The author's ids first, then the feedback id. */
  readonly 'aria-describedby'?: string | undefined;
}

/** What `getFormFieldControlProps` returns. */
export interface FormFieldControlParts {
  /** The root props, without a `class`. */
  readonly root: FormFieldControlRootProps;
  /** What the control reports to its FormField: the effective id and the effective facts. */
  readonly control: FormFieldControlState;
}
