'use client';

import { isValidElement, useEffect, useId, useRef, useState, type ReactElement, type Ref } from 'react';
import {
  CHECKBOX_GROUP_NAME_WARNING,
  checkboxGroupAnatomy,
  getCheckboxGroupProps,
  toggleCheckboxGroupValue,
} from '@cocokits/machines/checkbox-group';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { CheckboxGroupContext, type CheckboxGroupContextValue } from '../internal/checkbox-group-context';
import { isDevelopment } from '../internal/dev';
import { FormFieldContext, useFormFieldContext } from '../internal/form-field-context';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useControlClaim, useControlReport } from '../internal/use-field-control';
import { useControllableState } from '../internal/use-controllable-state';
import { useMergedRef } from '../internal/use-merged-ref';
import type {
  CheckboxGroupChangeDetails,
  CheckboxGroupProps,
  CheckboxGroupRenderProps,
  CheckboxGroupState,
} from './checkbox-group.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

const NO_VALUE: readonly string[] = [];

function CheckboxGroupImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  disabled,
  orientation,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  hidden,
  render,
  ref,
  children,
  ...rest
}: CheckboxGroupProps): ReactElement {
  const field = useFormFieldContext();
  const generatedId = useId();
  const themeAttrs = useThemeAttrs(checkboxGroupAnatomy).root;
  const elementRef = useRef<HTMLElement | null>(null);
  // What a form reset restores: the list at mount.
  const [mountValue] = useState<readonly string[]>(() => valueProp ?? defaultValue ?? NO_VALUE);
  const lastReset = useRef<Event | null>(null);
  const [value, setValue] = useControllableState<readonly string[], CheckboxGroupChangeDetails>({
    value: valueProp,
    defaultValue: mountValue,
    onChange: onValueChange,
    name: '<CheckboxGroup value>',
  });
  const primary = useControlClaim(
    field,
    elementRef,
    'This group gets no generated id and no description from the field, and its state does not reach the field.',
  );
  const parts = getCheckboxGroupProps(
    {
      value,
      orientation,
      ariaLabel,
      ariaLabelledBy,
      id: id === '' ? undefined : (id ?? (field !== null && primary ? undefined : generatedId)),
      ariaDescribedBy,
      name,
      disabled,
      hidden,
    },
    field ? { ids: primary ? field.ids : undefined, state: field.own, hasLabel: field.hasLabel } : undefined,
  );
  useControlReport(field, elementRef, primary, parts.control);

  const named = parts.named;
  useEffect(() => {
    if (!isDevelopment() || named) return undefined;
    // After the Label of the field has registered.
    const frame = requestAnimationFrame(() => {
      console.warn(CHECKBOX_GROUP_NAME_WARNING);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [named]);

  // The React Compiler memoizes the value; it changes only with the list and the two facts.
  const context: CheckboxGroupContextValue = {
    value,
    facts: parts.checkbox,
    toggle: (item, checked, details) => {
      setValue(toggleCheckboxGroupValue(value, item, checked), details);
    },
    reset: (event) => {
      // Every checkbox of the group reports the same reset; the group answers it once.
      if (event !== null && lastReset.current === event) return;
      lastReset.current = event;
      setValue(mountValue, { reason: 'form-reset', event });
    },
  };

  const elementProp = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementProp, elementRef);
  const props = mergeProps(
    { ...themeAttrs, ...toReactProps(parts.root), ref: mergedRef },
    { ...rest, hidden, children },
  ) as unknown as CheckboxGroupRenderProps;
  const state: CheckboxGroupState = {
    value,
    disabled: parts.root['data-disabled'] !== undefined,
    orientation: parts.root['data-orientation'],
  };
  return (
    // The checkboxes belong to the group: only the group is the control of the field.
    <FormFieldContext.Provider value={null}>
      <CheckboxGroupContext.Provider value={context}>
        {renderElement<CheckboxGroupRenderProps, CheckboxGroupState>(render, 'div', props, state)}
      </CheckboxGroupContext.Provider>
    </FormFieldContext.Provider>
  );
}

/** The {@link CheckboxGroup} component and its `displayName`. */
interface CheckboxGroupComponent {
  (props: CheckboxGroupProps): ReactElement;
  displayName: string;
}

/**
 * A set of checkboxes with one list of values. It renders a `<div role="group">` around the `Checkbox` elements,
 * each with a `value`.
 *
 * Name the group. Inside a `FormField`, the `Label` of the field names it through `aria-labelledby`. Alone, give it
 * `aria-label` or `aria-labelledby`. In development, a group with no name warns.
 *
 * Control the list with `value` and `onValueChange`, or set `defaultValue` and let the group keep it. Each
 * Checkbox takes its checked state from the list, and its `name` and `disabled` from the group. A user change adds
 * or removes its `value`. A form reset restores the list that the group had at mount.
 *
 * @example
 * <CheckboxGroup aria-label="Toppings" defaultValue={['cheese']}>
 *   <Checkbox value="cheese">Cheese</Checkbox>
 *   <Checkbox value="olives">Olives</Checkbox>
 * </CheckboxGroup>
 * @cckPart root
 * @param props - The CheckboxGroup props.
 * @returns The rendered element inside the providers.
 */
export const CheckboxGroup: CheckboxGroupComponent = Object.assign(CheckboxGroupImpl, {
  displayName: 'CheckboxGroup',
});
