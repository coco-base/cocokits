import { getCurrentInstance, useModel, type ModelRef } from 'vue';
import { isPropWritten } from '@cocokits/vue-core';

/**
 * A model with a start value for the uncontrolled case: `useModel`, which keeps Vue's own rule (a prop bound with a
 * listener is controlled; a prop bound without one is the start of local state), plus `defaultValue` for the
 * component that is not bound at all. `defaultValue` is read once, when the component is set up; later changes of it
 * and a parent that renders again do not reset the state. A bound prop, whatever its value, ignores `defaultValue`.
 *
 * @internal
 * @param props - The props of the component.
 * @param name - The name of the model prop (`open`, `modelValue`).
 * @param defaultValue - The start value, read now by the caller (`props.defaultOpen`).
 * @returns The model: it reads `defaultValue` until the component is bound or changed, and emits `update:<name>` on a write.
 */
export function useDefaultModel<T extends object, K extends keyof T & string>(
  props: T,
  name: K,
  defaultValue: T[K],
): ModelRef<T[K]> {
  const instance = getCurrentInstance();
  // `useModel` types its props as a record; the model keeps the type of the prop.
  return useModel(props as Record<string, unknown>, name, {
    get: (value) => (value === undefined && !isPropWritten(instance, name) ? defaultValue : value),
  }) as ModelRef<T[K]>;
}
