'use client';

import { useRef, type ReactElement } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { checkboxAnatomy, getCheckboxProps } from '@cocokits/machines/checkbox';
import type { ChoiceRootProps } from '../internal/choice-control.types';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderChoiceRoot } from '../internal/render-choice-root';
import { useMergedRef } from '../internal/use-merged-ref';
import { choiceInputReserved, useChoiceControl } from '../internal/use-choice-control';
import type { CheckboxProps, CheckboxState } from './checkbox.types';

function CheckboxImpl({
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate = false,
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
}: CheckboxProps): ReactElement {
  const themeAttrs = useThemeAttrs(checkboxAnatomy);
  const elementRef = useRef<HTMLInputElement | null>(null);
  const labelRef = useRef<HTMLLabelElement | null>(null);
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
    { componentName: 'Checkbox', elementRef, labelRef, indeterminate, getParts: getCheckboxProps },
  );
  const root = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      children: (
        <span {...themeAttrs.wrapper} {...toReactProps(parts.wrapper)}>
          <span {...themeAttrs.inputWrapper} {...toReactProps(parts.inputWrapper)}>
            <input
              {...themeAttrs.input}
              {...mergeProps(inputProps, withoutReserved(rest, choiceInputReserved))}
              ref={mergedRef}
            />
            <span {...themeAttrs.backdrop} {...toReactProps(parts.backdrop)} />
            <span {...themeAttrs.background} {...toReactProps(parts.background)} />
          </span>
          <label {...themeAttrs.label} {...toReactProps(parts.label)} ref={labelRef}>
            {children}
          </label>
        </span>
      ),
    },
    { className, style },
  ) as unknown as ChoiceRootProps;
  return renderChoiceRoot<CheckboxState>(render, root, { ...state, indeterminate });
}

/** The {@link Checkbox} component and its `displayName`. */
interface CheckboxComponent {
  (props: CheckboxProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `div` root around a native `<input type="checkbox">` and its label: the children are the
 * caption, so `<Checkbox>Accept the terms</Checkbox>` is a complete control. It is a real form control, so
 * `FormData` (`name=on`, or the `value`, while checked), constraint validation (`required`), reset, the
 * `form` attribute, `fieldset[disabled]` and the label click work natively, and it works with
 * react-hook-form `register()` and `Controller`. Without `checked` it is uncontrolled (`defaultChecked`, the
 * DOM holds the state); with `checked` it is controlled and a change the parent rejects is restored.
 *
 * `indeterminate` shows the mixed state and is one-way: the Checkbox never changes it, so the parent that
 * owns it recomputes it in `onCheckedChange`. `readOnly` blocks every user toggle, keeps the focus and the
 * submitted value, and renders `aria-readonly`.
 *
 * Inside a FormField the input gets the id `<fieldId>-control`, the field's Label and the caption both name
 * it ("Notifications Email me"), and its `aria-describedby` ends with the feedback wrapper. The state facts
 * are `data-*` attributes on the root, and `aria-invalid="true"` appears only while the control is invalid and
 * was touched or the form was submitted. `className`, `style`, `hidden` and `render` belong to the root;
 * every other attribute and `ref` belong to the input.
 *
 * @example
 * <Checkbox onCheckedChange={(checked) => setAccepted(checked)}>Accept the terms</Checkbox>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 * @param props - The Checkbox props.
 * @returns The rendered checkbox.
 */
export const Checkbox: CheckboxComponent = Object.assign(CheckboxImpl, { displayName: 'Checkbox' });
