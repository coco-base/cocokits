import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { FormFieldState } from '@cocokits/machines/form-field';
import type { ChangeDetails } from '@cocokits/shared';
import type { RenderProp } from './render-element';

/**
 * Why the checked value of a choice control changed: the user toggled it, or checked another radio of its
 * group (`'user'`), or the owner form was reset (`'form-reset'`).
 */
export type ChoiceControlChangeReason = 'user' | 'form-reset';

/** What `onCheckedChange` receives besides the value: the reason and the event behind it. */
export type ChoiceControlChangeDetails = ChangeDetails<ChoiceControlChangeReason>;

/** The attributes of the native input that the choice controls take their own typed props for, or never accept. */
type ChoiceOmitted =
  | 'color'
  | 'size'
  | 'type'
  | 'role'
  | 'children'
  | 'checked'
  | 'defaultChecked'
  | 'value'
  | 'id'
  | 'name'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'hidden'
  | 'aria-describedby'
  | 'aria-label'
  | 'aria-labelledby';

/**
 * Props every choice control shares. The root takes `className`, `style`, `hidden` and `render`; every other
 * native `input` attribute passes through to the native input, and `ref` reaches the input. Native
 * `onChange`, `onFocus`, `onBlur` and `onClick` run before the control's own handlers.
 */
export interface ChoiceBaseProps<S> extends Omit<ComponentPropsWithRef<'input'>, ChoiceOmitted> {
  /**
   * The checked value, which makes the control controlled: `null` renders unchecked, and `undefined` leaves
   * the control uncontrolled. A parent that does not update it after `onCheckedChange` keeps the old state.
   *
   * @defaultValue false
   */
  readonly checked?: boolean | null | undefined;
  /**
   * The initial checked state of an uncontrolled control. The DOM is the source, so a state written through
   * the ref (react-hook-form `register()`) stays across renders. A form reset restores it.
   *
   * @defaultValue false
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultChecked?: boolean | undefined;
  /**
   * Called after every change the user makes, from the input's native `change` event, and after a reset of the
   * owner form; never when the parent sets `checked`. `details.event` is that event, or the `reset` event after a reset.
   *
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: ChoiceControlChangeDetails) => void) | undefined;
  /** The `id` of the native input; generated when left out. An `id` you write replaces the generated one, and the label follows it. */
  readonly id?: string | undefined;
  /**
   * The name `FormData` submits. With react-hook-form, `register('terms')` passes it.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * The value `FormData` submits while the control is checked; left out, the browser submits `on`.
   *
   * @cckSemantic *.value
   * @cckParity A native attribute of the element.
   */
  readonly value?: string | undefined;
  /**
   * Disables the control. A disabling `fieldset` adds to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the control required (native `required`).
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Hides the control (native `hidden` on the root).
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly hidden?: boolean | undefined;
  /**
   * The ids this control is described by.
   *
   * @cckSemantic *.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * The accessible name of the input, for a control without content.
   *
   * @cckSemantic *.ariaLabel
   * @cckParity A native attribute of the element.
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the input.
   *
   * @cckSemantic *.ariaLabelledBy
   * @cckParity A native attribute of the element.
   */
  readonly 'aria-labelledby'?: string | undefined;
  /** The label content: the caption that names the control. */
  readonly children?: ReactNode;
  /**
   * Replaces the root element (a `div` by default): an element, or a function of the root props and the
   * state. The label content and the parts stay. `ref` reaches the input, not the root: the element form keeps
   * the element's own `ref`, and the function form receives no `ref`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<ChoiceRootProps, S> | undefined;
}

/** Props of the root the function form of `render` receives. Spread all of them, including `children`, onto one element. */
export interface ChoiceRootProps {
  /** The class of the block and of the author. */
  readonly className?: string | undefined;
  /** Any `data-*` attribute: the facts, the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The author's style. */
  readonly style?: ComponentPropsWithRef<'div'>['style'];
  /** Native `hidden`. */
  readonly hidden?: true | undefined;
  /** The parts. */
  readonly children: ReactNode;
}

/** Props of a Checkbox or a Switch: the shared choice props and the form state. */
export interface ChoiceControlBaseProps<S> extends ChoiceBaseProps<S> {
  /** The `id` of the native input. Inside a FormField it defaults to `<fieldId>-control`; otherwise it is generated. An `id` you write wins and both labels follow it. */
  readonly id?: string | undefined;
  /**
   * The name `FormData` submits. With react-hook-form, `register('terms')` passes it.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * Disables the control. A disabling `fieldset` and the field's `disabled` add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The ids this control is described by. Inside a FormField the feedback wrapper id is added after them.
   *
   * @cckSemantic *.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * Makes the control read-only: a click, a label click and Space change nothing and report nothing. It stays
   * focusable and is submitted.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Marks the control invalid. `aria-invalid` waits for `touched` or `submitted`.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * An asynchronous validator is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /** Whether the user left the control. Given, it wins; otherwise it is set after the first blur. */
  readonly touched?: boolean | undefined;
  /** Whether the user changed the control. Given, it wins; otherwise it is set after the first change. */
  readonly dirty?: boolean | undefined;
  /**
   * Whether a submit of the owner form was attempted. Given, it wins (bind it to the forms library's submit
   * state); otherwise a `submit` event of the form sets it, canceled ones included, and a reset clears it.
   */
  readonly submitted?: boolean | undefined;
}

/**
 * The public state of a Checkbox or a Switch, passed to the function form of `render`: the checked value and
 * the resolved facts (`disabled`, `readOnly`, `required`, `invalid`, `pending`, `touched`, `dirty`,
 * `submitted`, `focused`, `hidden`).
 */
export interface ChoiceControlState extends Omit<FormFieldState, 'filled'> {
  /** Whether the control is checked. */
  readonly checked: boolean;
}
