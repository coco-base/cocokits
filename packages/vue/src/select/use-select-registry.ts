import { computed, shallowRef, watch, type ComputedRef, type Ref, type ShallowRef } from 'vue';
import type { SelectItem } from '@cocokits/machines/select';
import { sortByDomOrder } from '@cocokits/utils';
import type { SelectItemRegistration } from './select.context';

/** What {@link useSelectRegistry} returns. */
export interface SelectRegistry<T> {
  /** The registered options, in document order once the list is open. */
  readonly registry: ShallowRef<readonly SelectItemRegistration<T>[]>;
  /** The options as machine items. */
  readonly items: ComputedRef<readonly SelectItem<T>[]>;
  /** Registers (or updates) an option; returns the function that removes it. */
  readonly registerItem: (option: SelectItemRegistration<T>) => () => void;
}

// The value is read live from the option (see SelectItem), so only the element and the disabled fact can
// make a registration stale.
const isSame = <T>(a: SelectItemRegistration<T> | undefined, b: SelectItemRegistration<T>): boolean =>
  a?.element === b.element && a.disabled === b.disabled;

/**
 * The items that have mounted. They mount with the list, so the registry is empty while the Select is
 * closed. While it is open the registry is put in document order after every change, because a late or moved
 * item registers out of order.
 *
 * @param isOpen - Whether the Select is open.
 * @returns The registry, the machine items and the registering function.
 */
export function useSelectRegistry<T>(isOpen: Readonly<Ref<boolean>>): SelectRegistry<T> {
  const registry = shallowRef<readonly SelectItemRegistration<T>[]>([]);

  function registerItem(option: SelectItemRegistration<T>): () => void {
    const current = registry.value;
    const index = current.findIndex((candidate) => candidate.key === option.key);
    if (index === -1) registry.value = [...current, option];
    else if (!isSame(current[index], option)) registry.value = current.map((at, i) => (i === index ? option : at));
    return () => {
      registry.value = registry.value.filter((candidate) => candidate.key !== option.key);
    };
  }

  const items = computed<readonly SelectItem<T>[]>(() =>
    registry.value.map((option) => ({
      key: option.key,
      // Read when used, not when the registry changes: the value of an option can change without a new registration.
      get value() {
        return option.value;
      },
      disabled: option.disabled,
      get id() {
        return option.id;
      },
      // Read when a key is pressed: the text of an item can change without a render.
      get text() {
        return option.text;
      },
    })),
  );

  watch(
    [isOpen, registry],
    ([open, current]) => {
      if (!open) return;
      const byElement = new Map(current.map((option) => [option.element, option]));
      const sorted = sortByDomOrder(current.map((option) => option.element)).flatMap((element) => {
        const option = byElement.get(element);
        return option ? [option] : [];
      });
      if (sorted.some((option, index) => option !== current[index])) registry.value = sorted;
    },
    { flush: 'post' },
  );

  return { registry, items, registerItem };
}
