import { computed, type ComputedRef, type ModelRef } from 'vue';
import { useDefaultModel } from '../internal/use-default-model';
import type { SelectItemData, SelectRootProps, SelectValueOf } from './select.types';

/** What {@link useSelectModel} returns. */
export interface SelectModel<T, M extends boolean> {
  /** The value: bound with `v-model`, or kept by the Select when it is not bound. */
  readonly model: ModelRef<SelectValueOf<T, M> | undefined>;
  /** The open state: bound with `v-model:open`, or kept by the Select when it is not bound. */
  readonly openModel: ModelRef<boolean | undefined>;
  /** The value at mount, which a form reset restores: the bound or default value, else `null` or an empty list with `multiple`. */
  readonly mountValue: SelectValueOf<T, M>;
  /** Whether several items can be selected. */
  readonly multiple: ComputedRef<boolean>;
  /** The value as a part gets it: never `undefined`, an unbound Select is `null` or an empty list. */
  readonly current: ComputedRef<SelectValueOf<T, M>>;
  /** The value of a single Select, `null` while it has none. */
  readonly single: () => T | null;
  /** The selected values as a list: one for a single Select, none while it has none. */
  readonly chosen: () => readonly T[];
  /** Writes a value the machine accepted; the model emits `update:modelValue`. */
  readonly write: (value: T | readonly T[] | null) => void;
  /** How two values are compared: `by` as a field name or a function, else `Object.is`. */
  readonly same: (a: T, b: T) => boolean;
  /** The `items` of the root as a list of entries. */
  readonly entries: ComputedRef<readonly SelectItemData<T>[]>;
}

/**
 * The value and the open state of a Select as models, and what the root reads from its props about them. It lives
 * in a `.ts` file so that the generic `T` of the component keeps its type for the compiler and the linter alike.
 *
 * @param props - The props of the SelectRoot.
 * @returns The two models, the value at mount and the helpers around the value.
 */
export function useSelectModel<T, M extends boolean>(props: SelectRootProps<T, M>): SelectModel<T, M> {
  const model = useDefaultModel(props, 'modelValue', props.defaultValue);
  // The model reads `defaultValue` only while the prop is unbound, so a bound `null` stays `null`.
  const mountValue = (model.value ?? (props.multiple ? [] : null)) as SelectValueOf<T, M>;
  const same = (a: T, b: T): boolean => {
    const { by } = props;
    if (by === undefined) return Object.is(a, b);
    if (typeof by === 'function') return by(a, b);
    const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;
    return isObject(a) && isObject(b) ? Object.is(Reflect.get(a, by), Reflect.get(b, by)) : Object.is(a, b);
  };
  const entries = computed<readonly SelectItemData<T>[]>(() => {
    const given = props.items;
    if (!given) return [];
    if (Array.isArray(given)) return given as readonly SelectItemData<T>[];
    return Object.entries(given as Readonly<Record<string, string>>).map(([value, label]) => ({
      value: value as T,
      label,
    }));
  });
  return {
    model,
    openModel: useDefaultModel(props, 'open', props.defaultOpen),
    mountValue,
    multiple: computed(() => !!props.multiple),
    current: computed(() => (model.value ?? (props.multiple ? [] : null)) as SelectValueOf<T, M>),
    single: () => (model.value ?? null) as T | null,
    chosen: () => {
      const value: unknown = model.value;
      if (Array.isArray(value)) return value as readonly T[];
      return value === null || value === undefined ? [] : [value as T];
    },
    write: (value) => {
      model.value = value as SelectValueOf<T, M>;
    },
    same,
    entries,
  };
}
