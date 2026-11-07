import { dataAttr } from '@cocokits/utils';
import { formFieldAnatomy } from './form-field.anatomy';
import type {
  FormFieldControlState,
  FormFieldIds,
  FormFieldOwnFacts,
  FormFieldPartIds,
  FormFieldParts,
  FormFieldProps,
  FormFieldRootProps,
  FormFieldState,
} from './form-field.types';

/** The ten `data-*` attributes that render the facts of a field and of its control: only the machine sets them. */
export const formFieldStateAttrs = [
  'data-disabled',
  'data-readonly',
  'data-required',
  'data-invalid',
  'data-pending',
  'data-touched',
  'data-dirty',
  'data-submitted',
  'data-focused',
  'data-filled',
] as const;

const partIds = (fieldId: string, kind: 'hint' | 'error', own: readonly (string | undefined)[] = []): string[] =>
  own.map((id, index) => (id === undefined || id === '' ? `${fieldId}-${kind}-${String(index + 1)}` : id));

/**
 * Derives the ids of a field from one field id.
 *
 * @param fieldId - The author's field id or a generated one.
 * @param parts - The author's `id` of each Hint and each FieldError the field holds, in document order.
 * @returns The control id, the feedback wrapper id, the label id, and the ids of the hints and of the errors: an
 * author's `id` wins, otherwise `<fieldId>-hint-<n>` or `<fieldId>-error-<n>`, counting from 1.
 */
export function formFieldIds(fieldId: string, parts: FormFieldPartIds = {}): FormFieldIds {
  return {
    control: `${fieldId}-control`,
    feedback: `${fieldId}-feedback`,
    label: `${fieldId}-label`,
    hints: partIds(fieldId, 'hint', parts.hints),
    errors: partIds(fieldId, 'error', parts.errors),
  };
}

/**
 * Merges the author's `aria-describedby` ids with more ids: the author's ids first, the others after them in
 * order, no duplicates. The default is never replaced.
 *
 * @param authorIds - The author's space-separated ids.
 * @param ids - The ids to add (the hint ids, then the error ids); leave them out when there are none.
 * @returns The merged value, or `undefined` when there is no id at all.
 */
export function mergeDescribedBy(
  authorIds: string | null | undefined,
  ...ids: readonly (string | null | undefined)[]
): string | undefined {
  const all = [...(authorIds ?? '').split(/\s+/).filter(Boolean), ...ids.filter(Boolean)] as string[];
  const unique = [...new Set(all)];
  return unique.length > 0 ? unique.join(' ') : undefined;
}

const anyTrue = (...flags: (boolean | undefined)[]): boolean => flags.some(Boolean);

/**
 * Resolves the facts of a field: the field's own value OR the control's, for every fact both can set.
 * Neither side can turn a fact off for the other. Pure.
 *
 * @param fieldProps - The facts the author set on the FormField.
 * @param control - What the registered control reported; leave it out while no control is registered.
 * @returns The facts the root renders.
 */
export function resolveFormFieldState(fieldProps?: FormFieldOwnFacts, control?: FormFieldControlState): FormFieldState {
  const own = fieldProps ?? {};
  const reported = control ?? {};
  return {
    disabled: anyTrue(own.disabled, reported.disabled),
    readOnly: anyTrue(own.readOnly, reported.readOnly),
    required: anyTrue(own.required, reported.required),
    invalid: anyTrue(own.invalid, reported.invalid),
    pending: anyTrue(reported.pending),
    touched: anyTrue(reported.touched),
    dirty: anyTrue(reported.dirty),
    submitted: anyTrue(reported.submitted),
    focused: anyTrue(reported.focused),
    filled: anyTrue(reported.filled),
    hidden: anyTrue(reported.hidden),
  };
}

/**
 * Whether two control states hold the same facts, key by key. A field uses it to keep its reported state when
 * the control reports again with nothing changed. A key present on one side only counts as a difference.
 *
 * @param a - The state reported before; `undefined` while no control reported.
 * @param b - The state reported now.
 * @returns `true` when both are the same object or hold the same values for every key.
 */
export function isSameFormFieldControlState(
  a: FormFieldControlState | undefined,
  b: FormFieldControlState | undefined,
): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return Object.keys({ ...a, ...b }).every(
    (fact) => a[fact as keyof FormFieldControlState] === b[fact as keyof FormFieldControlState],
  );
}

/** The `hidden` and the ten `data-*` attributes of the facts: the field root and its controls render the same. */
export function getFormFieldFactAttrs(state: FormFieldState): Omit<FormFieldRootProps, 'class'> {
  return {
    hidden: state.hidden ? true : undefined,
    'data-disabled': dataAttr(state.disabled),
    'data-readonly': dataAttr(state.readOnly),
    'data-required': dataAttr(state.required),
    'data-invalid': dataAttr(state.invalid),
    'data-pending': dataAttr(state.pending),
    'data-touched': dataAttr(state.touched),
    'data-dirty': dataAttr(state.dirty),
    'data-submitted': dataAttr(state.submitted),
    'data-focused': dataAttr(state.focused),
    'data-filled': dataAttr(state.filled),
  };
}

function rootProps(state: FormFieldState | undefined): FormFieldRootProps {
  const base = { class: formFieldAnatomy.classes.root };
  return state ? { ...base, ...getFormFieldFactAttrs(state) } : base;
}

/**
 * Computes the props of every FormField part. Pure.
 *
 * @param input - The resolved facts and the field id; both optional.
 * @returns The props of each part: the facts on the root, the feedback id on the feedback wrapper.
 */
export function getFormFieldProps(input?: FormFieldProps): FormFieldParts {
  const { classes } = formFieldAnatomy;
  const feedbackClass = { class: classes.feedbackWrapper };
  return {
    root: rootProps(input?.state),
    wrapper: { class: classes.wrapper },
    inputWrapper: { class: classes.inputWrapper },
    feedbackWrapper: input?.fieldId ? { ...feedbackClass, id: formFieldIds(input.fieldId).feedback } : feedbackClass,
  };
}
