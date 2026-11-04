import type { ModelRef } from 'vue';
import type { TabsValue } from '@cocokits/machines/tabs';
import { useDefaultModel } from '../internal/use-default-model';
import type { TabsRootProps } from './tabs.types';

/**
 * The value of the tabs as a model. It lives in a `.ts` file so that the generic `T` of the root keeps its type
 * for the compiler and the linter alike.
 *
 * @param props - The props of the TabsRoot.
 * @returns The model: bound with `v-model`, or kept by the tabs when it is not bound.
 */
export function useTabsModel<T extends TabsValue>(props: TabsRootProps<T>): ModelRef<T | undefined> {
  return useDefaultModel(props, 'modelValue', props.defaultValue);
}

/**
 * Writes the selected value into the model, which emits `update:modelValue`. The machine selects one of the
 * values of the triggers, which the root's own `T` types.
 *
 * @param model - The model of the root.
 * @param value - The value the machine selected.
 */
export function selectTabsValue<T extends TabsValue>(model: ModelRef<T | undefined>, value: TabsValue): void {
  model.value = value as T;
}
