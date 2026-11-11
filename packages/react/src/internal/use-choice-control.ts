'use client';

import { useEffect, useId, useState, type RefObject } from 'react';
import type { CheckboxProps } from '@cocokits/machines/checkbox';
import {
  resolveFormFieldState,
  type FormFieldState,
  type FormFieldControlContext,
  type FormFieldControlState,
} from '@cocokits/machines/form-field';
import { hasAccessibleName } from '@cocokits/utils';
import type { ChoiceControlBaseProps, ChoiceControlState } from './choice-control.types';
import { isDevelopment } from './dev';
import { useFormFieldContext } from './form-field-context';
import { withoutReserved } from './merge-props';
import { useControlClaim, useControlReport } from './use-field-control';
import { machineInputProps, useCheckedState } from './use-checked-state';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** The attributes the machine owns on the input: a value the author passes for them is ignored. */
export const choiceInputReserved: readonly string[] = ['aria-invalid', 'aria-readonly', 'type', 'role'];

/** What the hook needs from the machine result: the input, the root and the report for the field. */
interface ChoiceMachineParts {
  readonly root: object;
  readonly input: object;
  readonly control: FormFieldControlState;
}

/** What differs between the Checkbox and the Switch. */
export interface ChoiceControlOptions<P extends ChoiceMachineParts> {
  /** The component name, for the development warning. */
  readonly componentName: 'Checkbox' | 'Switch';
  /** The ref of the native input; the component merges it with the author's `ref`. */
  readonly elementRef: RefObject<HTMLInputElement | null>;
  /** Whether the Checkbox shows the mixed state. */
  readonly indeterminate: boolean;
  /** The machine call of the control. */
  readonly getParts: (state: CheckboxProps, field?: FormFieldControlContext) => P;
}

/** What {@link useChoiceControl} returns. */
export interface ChoiceControl<P> {
  /** The machine result. */
  readonly parts: P;
  /** The props for the native input: the machine's, the start state and the handlers. */
  readonly inputProps: Record<string, unknown>;
  /** The state for the function form of `render`. */
  readonly state: ChoiceControlState;
}

/**
 * Development only: warns after mount when nothing names the input of a Checkbox, a Switch or a Radio. It waits a
 * frame so that the field's Label has committed its `for`.
 */
export function useUnnamedWarning(componentName: string, elementRef: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    if (!isDevelopment()) return undefined;
    const frame = requestAnimationFrame(() => {
      const input = elementRef.current;
      if (input && !hasAccessibleName(input)) {
        console.warn(
          `CocoKits: a ${componentName} has no accessible name. Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [componentName, elementRef]);
}

/**
 * The behaviour of a Checkbox or a Switch in a FormField: the checked value (controlled or uncontrolled), the
 * tracked facts, the input id, form participation, the registration with the field and the development
 * warning. The two components call it and render their own parts.
 *
 * @param props - The shared props of the control.
 * @param options - What differs between the controls.
 * @returns The machine result, the props for the input and the state for `render`.
 */
export function useChoiceControl<P extends ChoiceMachineParts>(
  props: Omit<ChoiceControlBaseProps<unknown>, 'children' | 'render'>,
  options: ChoiceControlOptions<P>,
): ChoiceControl<P> {
  const { checked, defaultChecked, onCheckedChange, id, name, hidden, disabled, readOnly, required } = props;
  const { componentName, elementRef, indeterminate, getParts } = options;
  const field = useFormFieldContext();
  const generatedId = useId();
  const authorId = id === '' ? undefined : id;
  const [focused, setFocused] = useState(false);
  const [touchedState, setTouchedState] = useState(false);
  const [dirtyState, setDirtyState] = useState(false);
  const primary = useControlClaim(
    field,
    elementRef,
    'This control gets its own generated id and no description from the field, and its state does not reach the field.',
  );

  const model = useCheckedState({
    checked,
    defaultChecked,
    onCheckedChange,
    elementRef,
    followGroup: false,
    readOnly: readOnly === true || field?.own.readOnly === true,
    onUserChange: () => {
      setDirtyState(true);
    },
    onReset: () => {
      setTouchedState(false);
      setDirtyState(false);
    },
    // The browser clears the mixed state on a click, and a parent that does not change `indeterminate` re-renders
    // nothing, so the prop is written back after every reported change.
    onChangeReported: (element) => {
      if (element.indeterminate !== indeterminate) element.indeterminate = indeterminate;
    },
  });

  const parts = getParts(
    {
      checked: model.checked,
      indeterminate,
      // The inner label needs an id: the generated one stands in when the field gives the control no id.
      id: authorId ?? (field !== null && primary ? undefined : generatedId),
      ariaDescribedBy: props['aria-describedby'],
      name,
      disabled: disabled === true || model.participation.fieldsetDisabled,
      readOnly,
      required,
      invalid: props.invalid,
      pending: props.pending,
      touched: props.touched ?? touchedState,
      dirty: props.dirty ?? dirtyState,
      submitted: props.submitted ?? model.participation.submitted,
      focused,
      hidden,
    },
    field ? { ids: primary ? field.ids : undefined, state: field.own } : undefined,
  );
  useControlReport(field, elementRef, primary, parts.control);

  // The mixed state is a DOM property with no attribute: the prop owns it after mount and after every commit.
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element && element.indeterminate !== indeterminate) element.indeterminate = indeterminate;
  });
  useUnnamedWarning(componentName, elementRef);

  // `filled` is `checked`, which the state already has.
  const facts = withoutReserved({ ...resolveFormFieldState(undefined, parts.control) }, ['filled']) as Omit<
    FormFieldState,
    'filled'
  >;
  return {
    parts,
    state: { ...facts, checked: model.checked },
    inputProps: {
      ...machineInputProps(parts.input),
      ...model.inputProps,
      onFocus: () => {
        setFocused(true);
        model.readFromDom();
      },
      onBlur: () => {
        setFocused(false);
        setTouchedState(true);
        model.readFromDom();
      },
    },
  };
}
