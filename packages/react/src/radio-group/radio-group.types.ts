import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { RadioGroupChangeReason, RadioGroupOrientation } from '@cocokits/machines/radio-group';
import type { ChangeDetails, Direction } from '@cocokits/shared';

export type { RadioGroupChangeReason, RadioGroupOrientation };

/** What `onValueChange` receives besides the value: the reason and the event behind it. */
export type RadioGroupChangeDetails = ChangeDetails<RadioGroupChangeReason>;

/** The public state of the RadioGroup, passed to the function form of `render`. */
export interface RadioGroupState {
  /** The checked value, `null` while no radio is checked. */
  readonly value: string | null;
  /** Whether the group is disabled. */
  readonly disabled: boolean;
  /** Whether the group is required. */
  readonly required: boolean;
  /** The orientation, `undefined` while both axes move. */
  readonly orientation: RadioGroupOrientation | undefined;
}

/**
 * The props the function form of `render` receives: the native props merged with the group's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface RadioGroupRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-disabled` and `data-orientation`. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the group's `ref`, the rendered element's own `ref` and the group's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * Props of the {@link RadioGroup}. Native `div` props pass through to the root. Name the group with
 * `aria-labelledby` (a visible caption) or `aria-label`, and describe it with `aria-describedby`.
 */
export interface RadioGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue' | 'dir'> {
  /**
   * The radios: any markup that contains `Radio` components.
   *
   * @cckSemantic radio-group.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The value of the checked radio, which makes the group controlled; `null` checks none. A parent that does
   * not update it after `onValueChange` keeps the old value and the inputs are written back. A value that
   * matches no radio is kept and checks none.
   *
   * @cckSemantic radio-group.value
   */
  readonly value?: string | null | undefined;
  /**
   * The initial value of an uncontrolled group, read once. A form reset restores it.
   *
   * @cckSemantic none
   * @cckParity React's uncontrolled mode; Angular and Vue bind `value` as a model.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after every check the user makes (a click, a label click, Space or an arrow key), and after a reset
   * of the owner form that changes the value, with the new value and the reason. Never when the parent sets
   * `value`. The radios inside report nothing of their own.
   *
   * @cckSemantic radio-group.valueChange
   * @cckParity React's change callback; Angular emits `valueChangeDetails` and Vue emits `update:modelValue` only.
   */
  readonly onValueChange?: ((value: string | null, details: RadioGroupChangeDetails) => void) | undefined;
  /**
   * The `name` every radio of the group submits. Generated and stable between server and client when left out.
   * Not rendered on the root.
   *
   * @cckSemantic radio-group.name
   * @defaultValue generated
   */
  readonly name?: string | undefined;
  /**
   * Disables every radio and removes the tab stop. Adds to each radio's own `disabled`.
   *
   * @cckSemantic radio-group.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Requires one radio to be checked (native `required` on every input, `aria-required` on the root).
   *
   * @cckSemantic radio-group.required
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * The `form` attribute for the radios that have none of their own. Not rendered on the root.
   *
   * @cckSemantic radio-group.form
   */
  readonly form?: string | undefined;
  /**
   * Limits the arrow keys to one axis: `horizontal` moves with Left and Right, `vertical` with Up and Down.
   * Unset, both axes move.
   *
   * @cckSemantic radio-group.orientation
   * @defaultValue both axes
   */
  readonly orientation?: RadioGroupOrientation | undefined;
  /**
   * Whether the arrow keys wrap from the last radio to the first and back.
   *
   * @cckSemantic radio-group.loop
   * @defaultValue true
   */
  readonly loop?: boolean | undefined;
  /**
   * The text direction of the group and everything inside it, like a `DirectionProvider`: Left and Right swap
   * in `rtl`. Without it the nearest `DirectionProvider` applies, then `'ltr'`. Only a `dir` you pass is rendered.
   *
   * @cckSemantic none
   * @cckParity Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link RadioGroupState}. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: ReactElement | ((props: RadioGroupRenderProps, state: RadioGroupState) => ReactElement) | undefined;
}
