import type { FormFieldControlProps, FormFieldControlState } from '../form-field';

/**
 * Why the group value changed.
 *
 * @cckValue user - The user checked or unchecked a checkbox.
 * @cckValue form-reset - The form was reset.
 */
export type CheckboxGroupChangeReason = 'user' | 'form-reset';

/**
 * How the checkboxes are laid out. The theme draws it; the machine only renders it.
 *
 * @cckValue vertical - One checkbox under the other.
 * @cckValue horizontal - The checkboxes in a row.
 */
export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

/**
 * Inputs of `getCheckboxGroupProps`: the shared control props (see {@link FormFieldControlProps}) plus the value,
 * the orientation and the name of the group. A missing fact is `false`.
 */
export interface CheckboxGroupProps extends Omit<FormFieldControlProps, 'filled'> {
  /** The `value` of every checked checkbox, in the order they were checked. @defaultValue [] */
  readonly value?: readonly string[] | undefined;
  /** How the theme lays the checkboxes out. @defaultValue 'vertical' */
  readonly orientation?: CheckboxGroupOrientation | undefined;
  /** The author's `aria-label`. It names the group when no Label does. */
  readonly ariaLabel?: string | undefined;
  /** The id (or ids) of the element that names the group. It wins over the Label of the field. */
  readonly ariaLabelledBy?: string | undefined;
}

/** Props of the root part. Absent keys are `undefined`. */
export interface CheckboxGroupRootProps {
  /** The `cck-checkbox-group` block class. */
  readonly class: string;
  /** Always `'group'`. */
  readonly role: 'group';
  /** The author's id, or the control id inside a field. */
  readonly id?: string | undefined;
  /** The author's label. */
  readonly 'aria-label'?: string | undefined;
  /** The author's ids, else the id of the Label of the field. */
  readonly 'aria-labelledby'?: string | undefined;
  /** The author's ids first, then the hint ids, then the error ids. */
  readonly 'aria-describedby'?: string | undefined;
  /** Present (empty) while disabled, by the group or by its field. */
  readonly 'data-disabled'?: '' | undefined;
  /** Always set: `vertical` or `horizontal`. */
  readonly 'data-orientation': CheckboxGroupOrientation;
}

/** What the group gives each of its checkboxes. Absent keys are `undefined`. */
export interface CheckboxGroupCheckboxFacts {
  /** The shared `name` of the group; absent when there is none. */
  readonly name?: string | undefined;
  /** Native `disabled`: the group or its field is disabled. */
  readonly disabled?: true | undefined;
}

/** What `getCheckboxGroupProps` returns. */
export interface CheckboxGroupParts {
  /** The root props. */
  readonly root: CheckboxGroupRootProps;
  /** What every checkbox of the group gets: `name` and `disabled`. */
  readonly checkbox: CheckboxGroupCheckboxFacts;
  /** Whether the group has an accessible name: `aria-label`, `aria-labelledby` or a Label. Warn in development while `false`. */
  readonly named: boolean;
  /**
   * What the group reports to its FormField: the effective id and facts, `filled` = at least one value is checked,
   * and `group`, so the Label names the group through `aria-labelledby` and renders no `for`.
   */
  readonly control: FormFieldControlState;
}
