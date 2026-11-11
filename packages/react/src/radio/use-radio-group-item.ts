'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { ChoiceControlChangeDetails } from '../internal/choice-control.types';
import { isDevelopment } from '../internal/dev';
import { useUnnamedWarning } from '../internal/use-choice-control';
import type { RadioGroupContextValue, RadioGroupRegistration } from '../internal/radio-group-context';
import type { CheckedStateOptions } from '../internal/use-checked-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';

type CheckedModel = Pick<CheckedStateOptions, 'checked' | 'defaultChecked' | 'onCheckedChange'>;

/**
 * The checked model of a Radio. Inside a group the group value is the truth: the radio's own `checked`,
 * `defaultChecked` and `onCheckedChange` are ignored, and the radio only tells the group which one the user
 * checked, or that the owner form was reset.
 *
 * @param group - The group of the radio, `null` outside a group.
 * @param itemValue - The radio's submitted value, the identity inside a group.
 * @param own - The radio's own props.
 * @returns The options for the checked state.
 */
export function radioCheckedModel(
  group: RadioGroupContextValue | null,
  itemValue: string | undefined,
  own: CheckedModel,
): CheckedModel {
  if (!group) return own;
  return {
    checked: itemValue !== undefined && group.value === itemValue,
    defaultChecked: undefined,
    onCheckedChange: (next: boolean, details: ChoiceControlChangeDetails) => {
      if (details.reason === 'form-reset') group.reset(details.event);
      else if (next && itemValue !== undefined) group.setValue(itemValue, details);
    },
  };
}

/** What a Radio renders on its input: its own props, or what its group gives it. */
export interface RadioItemFacts {
  /** The native `name`. */
  readonly name: string | undefined;
  /** Whether the input is disabled. */
  readonly disabled: boolean;
  /** Whether the input is required. */
  readonly required: boolean;
  /** The native `form` of a radio inside a group; outside a group the author's own `form` passes through. */
  readonly form: string | undefined;
  /** The roving tab stop; absent outside a group and before mount. */
  readonly tabIndex: 0 | -1 | undefined;
}

/** What {@link useRadioGroupItem} needs from the radio. */
export interface RadioGroupItemOptions {
  /** The radio's group, `null` outside a group. */
  readonly group: RadioGroupContextValue | null;
  /** The radio's submitted value. */
  readonly itemValue: string | undefined;
  /** The `name` prop. */
  readonly name: string | undefined;
  /** Whether the radio is disabled by its prop or a fieldset. */
  readonly disabled: boolean;
  /** The `required` prop. */
  readonly required: boolean | undefined;
  /** The `form` prop. */
  readonly form: string | undefined;
  /** The input element ref. */
  readonly elementRef: RefObject<HTMLInputElement | null>;
}

/**
 * Registers a Radio with its group, keeps the group's list of radios current and resolves what the input
 * renders. Outside a group it returns the radio's own facts and registers nothing. Warns in development about
 * a radio that can never work (no value inside a group, no name outside one) and about a radio with no accessible name.
 *
 * @param options - The radio's facts and element.
 * @returns The facts for the input.
 */
export function useRadioGroupItem(options: RadioGroupItemOptions): RadioItemFacts {
  const { group, itemValue, name, disabled, required, form, elementRef } = options;
  // What the group reads when it lists its radios; set before the registration below runs.
  const registration = useRef<RadioGroupRegistration>({ element: null });
  useIsomorphicLayoutEffect(() => {
    registration.current = {
      value: itemValue,
      disabled,
      required: required === true,
      form,
      element: elementRef.current,
    };
  });
  const register = group?.register;
  useIsomorphicLayoutEffect(() => register?.(() => registration.current), [register]);
  const refresh = group?.refresh;
  useIsomorphicLayoutEffect(() => {
    refresh?.();
  });

  const inGroup = group !== null;
  useEffect(() => {
    if (!isDevelopment()) return;
    if (inGroup) {
      if (itemValue === undefined) {
        console.warn('CocoKits: a Radio inside a RadioGroup has no value. It can never be checked.');
      }
    } else if (name === undefined || name === '') {
      // A radio without a group mate is invalid HTML, and a guessed name would put every radio in its own group.
      console.warn(
        'CocoKits: a Radio has no name. Give every radio of a group the same name, otherwise it has no group mate.',
      );
    }
  }, [name, inGroup, itemValue]);

  useUnnamedWarning('Radio', elementRef);

  if (!group) return { name, disabled, required: required === true, form: undefined, tabIndex: undefined };
  const facts = group.facts({ value: itemValue, disabled, required, form });
  return {
    name: facts.name,
    disabled: facts.disabled === true,
    required: facts.required === true,
    form: facts.form,
    tabIndex: facts.tabIndex,
  };
}
