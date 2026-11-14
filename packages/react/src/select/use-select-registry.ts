'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SelectItem } from '@cocokits/machines/select';
import { sortByDomOrder } from '@cocokits/utils';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import type { SelectItemRegistration } from './select-item-registration';

/** What {@link useSelectRegistry} returns. */
export interface SelectRegistry<T> {
  /** The registered options, in document order once the list is open. */
  readonly registry: readonly SelectItemRegistration<T>[];
  /** The options as machine items. */
  readonly items: readonly SelectItem<T>[];
  /** Registers (or updates) an option; returns the function that removes it. */
  readonly registerItem: (option: SelectItemRegistration<T>) => () => void;
}

/** Whether the registry already holds this item: the value and the text are read live, so they are not compared. */
const isSame = <T>(a: SelectItemRegistration<T> | undefined, b: SelectItemRegistration<T>): boolean =>
  a?.element === b.element && a.disabled === b.disabled && a.id === b.id;

/**
 * The options that have mounted. They mount with the list, so the registry is empty while the Select is
 * closed. While it is open the registry is put in document order after every commit, because a late or moved
 * option registers out of order.
 *
 * @param isOpen - Whether the Select is open.
 * @returns The registry, the machine items and the registering function.
 */
export function useSelectRegistry<T>(isOpen: boolean): SelectRegistry<T> {
  const [registry, setRegistry] = useState<readonly SelectItemRegistration<T>[]>([]);

  const registerItem = useCallback((option: SelectItemRegistration<T>): (() => void) => {
    setRegistry((current) => {
      const index = current.findIndex((candidate) => candidate.key === option.key);
      if (index === -1) return [...current, option];
      if (isSame(current[index], option)) return current;
      return current.map((candidate, at) => (at === index ? option : candidate));
    });
    return () => {
      setRegistry((current) => current.filter((candidate) => candidate.key !== option.key));
    };
  }, []);

  const items = useMemo<readonly SelectItem<T>[]>(
    () =>
      registry.map((option) => ({
        key: option.key,
        // The option's latest value: it is read through a ref, so an inline object needs no registry update.
        get value() {
          return option.value;
        },
        disabled: option.disabled,
        id: option.id,
        // Read when a key is pressed: the text of an item can change without a render.
        get text() {
          return option.text;
        },
      })),
    [registry],
  );

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    const byElement = new Map(registry.map((option) => [option.element, option]));
    const sorted = sortByDomOrder(registry.map((option) => option.element)).flatMap((element) => {
      const option = byElement.get(element);
      return option ? [option] : [];
    });
    if (sorted.some((option, index) => option !== registry[index])) setRegistry(sorted);
  });

  return { registry, items, registerItem };
}
