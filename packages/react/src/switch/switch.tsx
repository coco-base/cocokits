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
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const trackRef = useRef<HTMLSpanElement | null>(null);
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
    { componentName: 'Switch', elementRef, labelRef, trackRef, indeterminate: false, getParts: getSwitchProps },
  );
  const root = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      children: (
        <label {...themeAttrs.label} {...toReactProps(parts.label)} ref={labelRef}>
          <span {...themeAttrs.track} {...toReactProps(parts.track)} ref={trackRef}>
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
 * Renders a `div` root around a native `<input type="checkbox" role="switch">` and its label: the children
 * are the caption, so `<Switch>Email notifications</Switch>` is a complete control. It behaves like the
 * Checkbox without the mixed state: a real form control (`FormData`, `required`, reset, the `form`
 * attribute, `fieldset[disabled]`, the label click), uncontrolled with `defaultChecked` or controlled with
 * `checked`, and usable with react-hook-form `register()` and `Controller`. Its state is the native `checked`,
 * never `aria-checked`, and `readOnly` blocks every user toggle while keeping the focus and the submitted
 * value.
 *
 * Inside a FormField the input gets the id `<fieldId>-control`, the field's Label and the caption both name
 * it, and its `aria-describedby` ends with the feedback wrapper. The state facts are `data-*` attributes on
 * the root. `className`, `style`, `hidden` and `render` belong to the root; every other attribute and `ref`
 * belong to the input.
 *
 * @example
 * <Switch onCheckedChange={(checked) => setNotify(checked)}>Email notifications</Switch>
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
