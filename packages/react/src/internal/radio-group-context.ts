'use client';

import { createContext, useContext, type Context } from 'react';
import type { RadioGroupItem, RadioGroupRadioFacts } from '@cocokits/machines/radio-group';
import type { ChoiceControlChangeDetails } from './choice-control.types';

/** What a Radio tells its group about itself. */
export interface RadioGroupRegistration extends RadioGroupItem {
  /** The radio's input element. */
  readonly element: HTMLInputElement | null;
}

/** What a RadioGroup gives the Radios inside it. Internal: not public API. */
export interface RadioGroupContextValue {
  /** The group value, `null` while no radio is checked. */
  readonly value: string | null;
  /** The facts of one radio: checked, name, disabled, required, form and the tab stop. */
  readonly facts: (item: RadioGroupItem) => RadioGroupRadioFacts;
  /** Sets the group value after a user check; reports through `onValueChange`. */
  readonly setValue: (value: string, details: ChoiceControlChangeDetails) => void;
  /** Restores the value the group had at mount after a reset of the owner form; once per reset event. */
  readonly reset: (event: Event | null) => void;
  /** Registers a radio; returns the function that unregisters it. */
  readonly register: (read: () => RadioGroupRegistration) => () => void;
  /** Lists the radios again, for a radio whose `value` or `disabled` changed. */
  readonly refresh: () => void;
}

/** The context of the RadioGroup; `null` outside a group. */
export const RadioGroupContext: Context<RadioGroupContextValue | null> = createContext<RadioGroupContextValue | null>(
  null,
);

/**
 * Reads the group of a Radio.
 *
 * @returns The group context, or `null` for a Radio outside a group.
 */
export function useRadioGroupContext(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
