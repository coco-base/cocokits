import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { FormFieldState } from '@cocokits/machines/form-field';
import type { ChangeDetails } from '@cocokits/shared';
import type { RenderProp } from './render-element';

/**
 * Why the checked value of a choice control changed.
 *
 * @cckValue user - The user checked or unchecked the control, or checked another radio of its group.
 * @cckValue form-reset - The form of the control was reset.
 */
export type ChoiceControlChangeReason = 'user' | 'form-reset';

/** What `onCheckedChange` receives besides the value: the `reason` and the `event` behind the change. */
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
 * Props that every choice control shares. The root takes `className`, `style`, `hidden` and `render`. Every other
 * native `input` prop passes through to the native input, and `ref` reaches the input.
 *
 * Native `onChange`, `onFocus`, `onBlur` and `onClick` run before the handlers of the control.
 */
export interface ChoiceBaseProps<S> extends Omit<ComponentPropsWithRef<'input'>, ChoiceOmitted> {
  /**
   * Whether the control is checked. Setting it makes the control controlled, and `null` shows it unchecked. If you
   * do not update it after `onCheckedChange`, the old state stays.
   *
   * @defaultValue false
   */
  readonly checked?: boolean | null | undefined;
  /**
   * The start state of a control that you do not control with `checked`. The DOM holds the state, so a state that
   * react-hook-form `register()` writes through the ref stays. A form reset restores it.
   *
   * @defaultValue false
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultChecked?: boolean | undefined;
  /**
   * Called after the user checks or unchecks the control, and after a reset of its form. It receives the new state
   * and a details object with the `reason` and the `event`.
   *
   * The `event` is the native `change` event, or the `reset` event after a reset. It is never called when you
   * change `checked` yourself.
   *
   * @cckSemantic *.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: ChoiceControlChangeDetails) => void) | undefined;
  /**
   * The `id` of the native input. An `id` you write replaces the made one, and the label follows it. When not set,
   * the control makes a unique `id`.
   */
  readonly id?: string | undefined;
  /**
   * The name that `FormData` sends. With react-hook-form, `register('terms')` passes it. When not set, the form
   * does not send the control.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * The value that `FormData` sends while the control is checked. When not set, the browser sends `on`.
   *
   * @cckSemantic *.value
   * @cckParity A native attribute of the element.
   */
  readonly value?: string | undefined;
  /**
   * Whether the control is disabled. A disabled `fieldset` around it also disables it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the control must be checked before the form can submit. It sets the native `required`.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the control is hidden. It sets the native `hidden` on the root. When not set, the control shows.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly hidden?: boolean | undefined;
  /**
   * The ids of the elements that describe the control. When not set, the control has no description of its own.
   *
   * @cckSemantic *.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * The accessible name of the input. Use it for a control without a caption. When not set, the caption names the
   * control.
   *
   * @cckSemantic *.ariaLabel
   * @cckParity A native attribute of the element.
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the input. When not set, the caption names the control.
   *
   * @cckSemantic *.ariaLabelledBy
   * @cckParity A native attribute of the element.
   */
  readonly 'aria-labelledby'?: string | undefined;
  /** The caption that names the control. */
  readonly children?: ReactNode;
  /**
   * Replaces the root element. Pass an element, or a function of the root props and the state of the control. The
   * caption and the inner parts stay.
   *
   * When not set, the root is a `<div>`. The `ref` reaches the input, not the root. The element form keeps the
   * `ref` of the element, and the function form receives no `ref`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<ChoiceRootProps, S> | undefined;
}

/** The root props that the function form of `render` receives. Pass all of them, `children` too, to one element. */
export interface ChoiceRootProps {
  /** The class of the block and your own class. */
  readonly className?: string | undefined;
  /** Any `data-*` attribute: the state of the control and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** Your own style. */
  readonly style?: ComponentPropsWithRef<'div'>['style'];
  /** The native `hidden`. */
  readonly hidden?: true | undefined;
  /** The inner parts and the caption. */
  readonly children: ReactNode;
}

/** Props of a Checkbox or a Switch: the shared choice props and the form state. */
export interface ChoiceControlBaseProps<S> extends ChoiceBaseProps<S> {
  /**
   * The `id` of the native input. An `id` you write replaces the made one, and both labels follow it. When not set,
   * the input inside a `FormField` gets `<fieldId>-control`, and any other input gets a unique `id`.
   */
  readonly id?: string | undefined;
  /**
   * The name that `FormData` sends. With react-hook-form, `register('terms')` passes it. When not set, the form
   * does not send the control.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly name?: string | undefined;
  /**
   * Whether the control is disabled. A disabled `fieldset` around it, or a disabled `FormField`, also disables it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The ids of the elements that describe the control. Inside a `FormField`, the ids of its hints and then of its
   * errors follow them. When not set, only the field describes the control.
   *
   * @cckSemantic *.ariaDescribedBy
   * @cckParity Spelled as the native `aria-describedby` attribute.
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * Whether the control is read-only. A click, a click on the label and Space change nothing and call nothing. The
   * control can still take the focus, and the form still sends it.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Whether the value is not valid. The control gets `aria-invalid` only after the user has left it or has tried to
   * submit the form.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Whether an async check of the value is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Whether the user has left the control. A value you pass wins. When not set, the control sets it after the first
   * blur.
   */
  readonly touched?: boolean | undefined;
  /**
   * Whether the user has changed the control. A value you pass wins. When not set, the control sets it after the
   * first change.
   */
  readonly dirty?: boolean | undefined;
  /**
   * Whether the user has tried to submit the form. A value you pass wins, so you can bind the submit state of a
   * form library.
   *
   * When not set, a `submit` event of the form sets it, also a canceled one, and a form reset clears it.
   */
  readonly submitted?: boolean | undefined;
}

/**
 * The state of a Checkbox or a Switch that the function form of `render` receives. It holds the checked value and
 * the state of the control: `disabled`, `readOnly`, `required`, `invalid`, `pending`, `touched`, `dirty`,
 * `submitted`, `focused` and `hidden`.
 */
export interface ChoiceControlState extends Omit<FormFieldState, 'filled'> {
  /** Whether the control is checked. */
  readonly checked: boolean;
}
