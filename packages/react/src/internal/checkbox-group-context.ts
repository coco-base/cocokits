'use client';

import { createContext, useContext, type Context } from 'react';
import type { CheckboxGroupCheckboxFacts } from '@cocokits/machines/checkbox-group';
import type { ChoiceControlChangeDetails } from './choice-control.types';

/** What a CheckboxGroup gives the Checkboxes inside it. Internal: not public API. */
export interface CheckboxGroupContextValue {
  /** The `value` of every checked checkbox of the group. */
  readonly value: readonly string[];
  /** What every checkbox gets from the group: `name` and `disabled`. */
  readonly facts: CheckboxGroupCheckboxFacts;
  /** Adds or removes one value after a user change; reports through `onValueChange`. */
  readonly toggle: (item: string, checked: boolean, details: ChoiceControlChangeDetails) => void;
  /** Restores the value the group had at mount after a reset of the owner form; once per reset event. */
  readonly reset: (event: Event | null) => void;
}

/** The context of the CheckboxGroup; `null` outside a group. */
export const CheckboxGroupContext: Context<CheckboxGroupContextValue | null> =
  createContext<CheckboxGroupContextValue | null>(null);

/**
 * Reads the group of a Checkbox.
 *
 * @returns The group context, or `null` for a Checkbox outside a group.
 */
export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}
