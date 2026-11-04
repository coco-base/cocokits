'use client';

import { useId, useRef, type ReactElement } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getRadioProps, radioAnatomy } from '@cocokits/machines/radio';
import type { ChoiceRootProps } from '../internal/choice-control.types';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderChoiceRoot } from '../internal/render-choice-root';
import { machineInputProps, useCheckedState } from '../internal/use-checked-state';
import { useRadioGroupContext } from '../internal/radio-group-context';
import { choiceInputReserved } from '../internal/use-choice-control';
import { useMergedRef } from '../internal/use-merged-ref';
import type { RadioProps, RadioState } from './radio.types';
import { radioCheckedModel, useRadioGroupItem } from './use-radio-group-item';

function RadioImpl({
  checked,
  defaultChecked,
  onCheckedChange,
  id,
  name,
  disabled,
  required,
  render,
  className,
  style,
  hidden,
  children,
  ref,
  ...rest
}: RadioProps): ReactElement {
  const themeAttrs = useThemeAttrs(radioAnatomy);
  const elementRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRef<HTMLInputElement>(ref, elementRef, undefined);
  const generatedId = useId();
  const group = useRadioGroupContext();
  // Inside a group the radio is identified by its submitted value.
  const itemValue = typeof rest.value === 'string' ? rest.value : undefined;
  const model = useCheckedState({
    ...radioCheckedModel(group, itemValue, { checked, defaultChecked, onCheckedChange }),
    elementRef,
    followGroup: true,
    readOnly: false,
  });
  const item = useRadioGroupItem({
    group,
    itemValue,
    name,
    disabled: disabled === true || model.participation.fieldsetDisabled,
    required,
    form: rest.form,
    elementRef,
  });
  const parts = getRadioProps({
    checked: model.checked,
    id: id === undefined || id === '' ? generatedId : id,
    name: item.name,
    disabled: item.disabled,
    required: item.required,
    tabIndex: item.tabIndex,
  });

  const rootProps = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      children: (
        <span {...themeAttrs.wrapper} {...toReactProps(parts.wrapper)}>
          <span {...themeAttrs.inputWrapper} {...toReactProps(parts.inputWrapper)}>
            <input
              {...themeAttrs.input}
              {...mergeProps(
                {
                  ...machineInputProps(parts.input),
                  ...model.inputProps,
                  form: item.form,
                  onFocus: model.readFromDom,
                  onBlur: model.readFromDom,
                },
                withoutReserved(rest, group ? [...choiceInputReserved, 'tabIndex'] : choiceInputReserved),
              )}
              ref={mergedRef}
            />
            <span {...themeAttrs.backdrop} {...toReactProps(parts.backdrop)} />
            <span {...themeAttrs.background} {...toReactProps(parts.background)} />
          </span>
          <label {...themeAttrs.label} {...toReactProps(parts.label)}>
            {children}
          </label>
        </span>
      ),
    },
    { className, style, hidden },
  ) as unknown as ChoiceRootProps;
  const state: RadioState = {
    checked: model.checked,
    disabled: parts.input.disabled === true,
    required: parts.input.required === true,
  };
  return renderChoiceRoot<RadioState>(render, rootProps, state);
}

/** The {@link Radio} component and its `displayName`. */
interface RadioComponent {
  (props: RadioProps): ReactElement;
  displayName: string;
}

/**
 * Renders one standalone `div` root around a native `<input type="radio">` and its label: the children are
 * the caption. Radios with the same `name` form a native group: the browser unchecks the others and the arrow
 * keys move focus and the check. When the user checks another radio of the group, this radio's state becomes
 * unchecked and `onCheckedChange` fires with `false`, the reason `'user'` and the other radio's event. A
 * parent that sets one radio's `checked` and not the others gets no event for the others: write every radio's
 * `checked` from one selected value. A radio without `name` has no group mate, so it warns in development.
 *
 * Inside a `RadioGroup` the group owns the value: a Radio is identified by its `value`, is checked while the group
 * value equals it, and takes `name`, `disabled`, `required`, `form` (its own wins) and its tab stop from the group.
 * Its own `checked`, `defaultChecked`, `name` and `tabIndex` are ignored and `onCheckedChange` never fires; the
 * group's keys apply. A Radio without a `value` in a group can never be checked and warns in development.
 *
 * Without `checked` it is uncontrolled (`defaultChecked`, the DOM holds the state); with `checked` it is
 * controlled and a change the parent rejects is restored. It is a real form control (`FormData`,
 * `required`, reset, the `form` attribute, `fieldset[disabled]`). It takes no part in the FormField contract,
 * and has no read-only state or form state facts. `className`, `style`, `hidden` and `render` belong to the root; every
 * other attribute and `ref` belong to the input.
 *
 * @example
 * <fieldset>
 *   <legend>Plan</legend>
 *   <Radio name="plan" value="free" defaultChecked>Free</Radio>
 *   <Radio name="plan" value="pro">Pro</Radio>
 * </fieldset>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 * @param props - The Radio props.
 * @returns The rendered radio.
 */
export const Radio: RadioComponent = Object.assign(RadioImpl, { displayName: 'Radio' });
