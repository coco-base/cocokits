'use client';

import { useRef, type ReactElement } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { checkboxAnatomy, getCheckboxProps } from '@cocokits/machines/checkbox';
import type { ChoiceRootProps } from '../internal/choice-control.types';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { usePartIconContent } from '../internal/part-icon-content';
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
    { componentName: 'Checkbox', elementRef, indeterminate, getParts: getCheckboxProps },
  );
  const tick = usePartIconContent(checkboxAnatomy, 'background', undefined, state.checked && !indeterminate);
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
            <span {...themeAttrs.background} {...toReactProps(parts.background)}>
              {tick}
            </span>
          </span>
          <label {...themeAttrs.label} {...toReactProps(parts.label)}>
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
 * A box that the user checks or unchecks. It renders a `<div>` around a native `<input type="checkbox">` and a
 * label with the children as caption. `<Checkbox>Accept the terms</Checkbox>` is a complete control.
 *
 * The caption text names the control. With no caption text, add `aria-label` or `aria-labelledby`, or a
 * `<label for>` with text.
 *
 * It is a native form control. `FormData`, `required`, a form reset, the `form` prop, a disabled `fieldset` and a
 * click on the label work as for a native checkbox. It works with react-hook-form `register()` and `Controller`.
 *
 * Control it with `checked` and `onCheckedChange`, or set `defaultChecked` and let the DOM keep the state. A
 * change that you do not take is undone.
 *
 * Inside a `FormField`, the input gets the id `<fieldId>-control`, and the field label and the caption both name
 * it. The ids of the hints and errors of the field describe it.
 *
 * While the checkbox is checked and not indeterminate, its background holds the tick icon that the theme names for
 * it, drawn with `SvgIcon`.
 *
 * The root has the state as `data-*` attributes. The input gets `aria-invalid="true"` only while it is not valid
 * and the user has left it or tried to submit. `className`, `style`, `hidden` and `render` go to the root; every
 * other prop and `ref` go to the input.
 *
 * @example
 * <Checkbox name="terms" defaultChecked>
 *   Accept the terms
 * </Checkbox>
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
