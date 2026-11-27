import { inject, type InjectionKey } from 'vue';
import type { RadioGroupItem, RadioGroupRadioFacts } from '@cocokits/machines/radio-group';

/** What a Radio tells its RadioGroup about itself: getters, so a change after mount is seen on the next read. */
export interface RadioGroupRegistration {
  /** The radio's value; `undefined` for a radio without one. */
  readonly value: () => string | undefined;
  /** Whether the radio is disabled, a disabling fieldset included. */
  readonly disabled: () => boolean;
  /** Whether the radio is required. */
  readonly required: () => boolean;
  /** The radio's own `form`. */
  readonly form: () => string | undefined;
  /** The native input, `null` before mount. */
  readonly element: () => HTMLInputElement | null;
  /** Writes the group's checked state to the input again. */
  readonly sync: () => void;
}

/** What a RadioGroup gives its Radios. */
export interface RadioGroupContextValue {
  /** The facts the group gives one radio; reactive on the group state. */
  readonly facts: (item: RadioGroupItem) => RadioGroupRadioFacts;
  /** Registers a radio after mount; returns the function that unregisters it. */
  readonly register: (entry: RadioGroupRegistration) => () => void;
  /** Lists the registered radios again: call it after a render that may have moved or changed one. */
  readonly refresh: () => void;
  /** The user checked the radio with this value (`undefined`: a radio without a value). */
  readonly userChecked: (value: string | undefined) => void;
  /** The owner form was reset; every radio reports it, the group acts once per reset. */
  readonly formReset: (event: Event) => void;
}

/** Injection key of the radio group context. Not exported from any entry point. */
export const RADIO_GROUP_KEY: InjectionKey<RadioGroupContextValue> = Symbol('cck-radio-group');

/** @returns The context of the nearest RadioGroup, or `undefined` for a standalone Radio. */
export function useRadioGroupContext(): RadioGroupContextValue | undefined {
  return inject(RADIO_GROUP_KEY, undefined);
}
