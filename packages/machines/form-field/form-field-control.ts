import { getFormFieldFactAttrs, mergeDescribedBy, resolveFormFieldState } from './form-field';
import type {
  FormFieldControlContext,
  FormFieldControlParts,
  FormFieldControlProps,
  FormFieldControlRootProps,
} from './form-field-control.types';
import type { FormFieldState } from './form-field.types';

/**
 * The gate of the invalid look that reaches the user: the field is invalid, and the user left the control or
 * tried to submit. `aria-invalid` and the FieldError both use it, so they cannot disagree.
 *
 * @param state - The resolved facts of the field.
 * @returns `true` while the invalid state should be shown.
 */
export function invalidShown(state: Pick<FormFieldState, 'invalid' | 'touched' | 'submitted'>): boolean {
  return state.invalid && (state.touched || state.submitted);
}

/**
 * Whether a text value counts as filled: not `null`, `undefined` or `''`.
 *
 * @param value - The model value of a text control.
 * @returns `true` when there is text.
 */
export const isFilledText = (value: string | null | undefined): boolean =>
  value !== null && value !== undefined && value !== '';

/**
 * Defaults `name` from the path of a bound forms control.
 *
 * @returns The segments joined with `.`, or `undefined` for an empty path, an empty segment or a lone
 * numeric segment (a root array index, which names nothing).
 */
function nameFromPath(path: FormFieldControlProps['controlPath']): string | undefined {
  const segments = (path ?? []).map(String);
  const isRootArrayIndex = segments.length === 1 && /^\d+$/.test(segments[0] ?? '');
  return segments.length === 0 || segments.includes('') || isRootArrayIndex ? undefined : segments.join('.');
}

const nonEmpty = (value: string | undefined): string | undefined => (value === '' ? undefined : value);

const native = (condition: boolean): true | undefined => (condition ? true : undefined);

function rootProps(
  props: FormFieldControlProps,
  facts: FormFieldState,
  field?: FormFieldControlContext,
): FormFieldControlRootProps {
  return {
    // A control renders the same facts as the field root: native hidden and the ten data-*.
    ...getFormFieldFactAttrs(facts),
    id: nonEmpty(props.id) ?? field?.ids?.control,
    name: nonEmpty(props.name) ?? nameFromPath(props.controlPath),
    disabled: native(facts.disabled),
    readonly: native(facts.readOnly),
    required: native(facts.required),
    'aria-invalid': invalidShown(facts) ? 'true' : undefined,
    'aria-describedby': mergeDescribedBy(
      props.ariaDescribedBy,
      ...(field?.ids?.hints ?? []),
      ...(field?.ids?.errors ?? []),
    ),
  };
}

/**
 * Computes what every form-field control renders: ids, `name`, the native `disabled`, `readonly` and
 * `required`, the `aria-invalid` gate, `aria-describedby` and the ten `data-*` facts. Pure: no DOM, same
 * result on the server and the client. Each fact the field can set (disabled, read-only, required, invalid)
 * is the field's value OR the control's. Absent props are `undefined`. The root has no `class`: the Input and the
 * Textarea add their own (and the Input its `type`).
 *
 * The generated control id is only a fallback: with no field id there is none, and an author `id` wins.
 *
 * @param props - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the control; leave it out outside a field.
 * @returns The root props, without a `class`, and the control state for the field.
 */
export function getFormFieldControlProps(
  props: FormFieldControlProps,
  field?: FormFieldControlContext,
): FormFieldControlParts {
  const facts = resolveFormFieldState(field?.state, { ...props, filled: props.filled ?? false });
  const root = rootProps(props, facts, field);
  return { root, control: { ...facts, id: root.id } };
}
