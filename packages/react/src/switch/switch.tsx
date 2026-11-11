'use client';

import { useRef, type ReactElement } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getSwitchProps, switchAnatomy } from '@cocokits/machines/switch';
import type { ChoiceRootProps } from '../internal/choice-control.types';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderChoiceRoot } from '../internal/render-choice-root';
import { useMergedRef } from '../internal/use-merged-ref';
import { choiceInputReserved, useChoiceControl } from '../internal/use-choice-control';
import type { SwitchProps, SwitchState } from './switch.types';

function SwitchImpl({
  checked,
  defaultChecked,
  onCheckedChange,
  id,
  name,
  'aria-describedby': ariaDescribedBy,
  disabled,
  readOnly,
  required,
  hidden,
  invalid,
  pending,
  touched,
  dirty,
  submitted,
  render,
  className,
  style,
  children,
  ref,
  ...rest
}: SwitchProps): ReactElement {
  const themeAttrs = useThemeAttrs(switchAnatomy);
  const elementRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRef<HTMLInputElement>(ref, elementRef, undefined);
  const { parts, inputProps, state } = useChoiceControl(
    {
      checked,
      defaultChecked,
      onCheckedChange,
      id,
      name,
      'aria-describedby': ariaDescribedBy,
      disabled,
      readOnly,
      required,
      hidden,
      invalid,
      pending,
      touched,
      dirty,
      submitted,
    },
    { componentName: 'Switch', elementRef, indeterminate: false, getParts: getSwitchProps },
  );
  const root = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      children: (
        <label {...themeAttrs.label} {...toReactProps(parts.label)}>
          <span {...themeAttrs.track} {...toReactProps(parts.track)}>
            <input
              {...themeAttrs.input}
              {...mergeProps(inputProps, withoutReserved(rest, choiceInputReserved))}
              ref={mergedRef}
            />
            <span {...themeAttrs.thumb} {...toReactProps(parts.thumb)} />
            <span {...themeAttrs.backdrop} {...toReactProps(parts.backdrop)} />
          </span>
          {children}
        </label>
      ),
    },
    { className, style },
  ) as unknown as ChoiceRootProps;
  return renderChoiceRoot<SwitchState>(render, root, state);
}

/** The {@link Switch} component and its `displayName`. */
interface SwitchComponent {
  (props: SwitchProps): ReactElement;
  displayName: string;
}

/**
 * A control that turns a setting on or off. It renders a `<div>` around a native
 * `<input type="checkbox" role="switch">` and a label with the children as caption.
 *
 * It is a native form control. `FormData`, `required`, a form reset, the `form` prop, a disabled `fieldset` and a
 * click on the label work as for a native checkbox. It works with react-hook-form `register()` and `Controller`.
 *
 * Control it with `checked` and `onCheckedChange`, or set `defaultChecked` and let the DOM keep the state. Its
 * state is the native `checked`, never `aria-checked`.
 *
 * Inside a `FormField`, the input gets the id `<fieldId>-control`, and the field label and the caption both name
 * it. The ids of the hints and errors of the field describe it.
 *
 * The root has the state as `data-*` attributes. `className`, `style`, `hidden` and `render` go to the root; every
 * other prop and `ref` go to the input.
 *
 * @example
 * <Switch name="notify" defaultChecked>
 *   Email notifications
 * </Switch>
 * @cckPart root
 * @cckPart label
 * @cckPart track
 * @cckPart input
 * @cckPart thumb
 * @cckPart backdrop
 * @param props - The Switch props.
 * @returns The rendered switch.
 */
export const Switch: SwitchComponent = Object.assign(SwitchImpl, { displayName: 'Switch' });
