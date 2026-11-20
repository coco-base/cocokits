import { inject, type ComputedRef, type InjectionKey } from 'vue';

/** What a CheckboxGroup gives its Checkboxes. */
export interface CheckboxGroupContextValue {
  /** The `value` of every checked checkbox. */
  readonly value: ComputedRef<readonly string[]>;
  /** The shared `name`; `undefined` when the group has none. */
  readonly name: ComputedRef<string | undefined>;
  /** Whether the group, or its FormField, is disabled. */
  readonly disabled: ComputedRef<boolean>;
  /** Adds or removes the `value` of a checkbox: the user checked or unchecked it, or a form reset it. */
  readonly set: (item: string, checked: boolean) => void;
}

/** Injection key of the checkbox group context. Not exported from any entry point. */
export const CHECKBOX_GROUP_KEY: InjectionKey<CheckboxGroupContextValue> = Symbol('cck-checkbox-group');

/** @returns The context of the nearest CheckboxGroup, or `undefined` for a standalone Checkbox. */
export function useCheckboxGroupContext(): CheckboxGroupContextValue | undefined {
  return inject(CHECKBOX_GROUP_KEY, undefined);
}
