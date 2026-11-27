'use client';

import { useState } from 'react';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';
import { useControllableState } from '../internal/use-controllable-state';
import type { SelectChangeDetails, SelectOpenChangeDetails, SelectRootProps } from './select.types';

/** The value of a Select as the model holds it: a `T`, a list of `T` with `multiple`, or `null` (nothing selected). */
export type SelectModelValue<T> = T | readonly T[] | null;

/** What {@link useSelectModel} returns. */
export interface SelectModel<T> {
  /** The current value. */
  readonly value: SelectModelValue<T>;
  /** Changes the value and reports it through `onValueChange`; `false` when `onValueChange` canceled it. */
  readonly setValue: (
    next: SelectModelValue<T>,
    details: { reason: SelectValueReason; event: Event | null },
  ) => boolean;
  /** The value at mount, which a form reset restores. */
  readonly mountValue: SelectModelValue<T>;
  /** Whether the list is open (before the disabled and read-only gate). */
  readonly open: boolean;
  /** Changes the open state and reports it through `onOpenChange`; `false` when `onOpenChange` canceled it. */
  readonly setOpen: (next: boolean, details: { reason: SelectOpenReason; event: Event | null }) => boolean;
}

/** Details whose `cancel()` has no effect: a focus-out close cannot be refused. */
function uncancelable(details: SelectOpenChangeDetails): SelectOpenChangeDetails {
  return { reason: details.reason, event: details.event, cancel: () => undefined, isCanceled: false };
}

/**
 * The value and the open state of a Select, each controlled (`value`, `open`) or uncontrolled (`defaultValue`,
 * `defaultOpen`). An empty value is `null`, or an empty list with `multiple`. Both callbacks can refuse a
 * change with `details.cancel()`, except an open change caused by focus leaving the trigger.
 *
 * @param props - The Select props.
 * @returns The value, the open state, their setters and the value at mount.
 */
export function useSelectModel<T, M extends boolean>(props: SelectRootProps<T, M>): SelectModel<T> {
  const { value: valueProp, defaultValue, onValueChange, open: openProp, defaultOpen = false, onOpenChange } = props;
  const empty = (props.multiple ? [] : null) as SelectModelValue<T>;
  // A controlled `null` is a value: it must not give way to `defaultValue`.
  const controlled = valueProp !== undefined;
  const [mountValue] = useState<SelectModelValue<T>>(() =>
    controlled ? valueProp : ((defaultValue as SelectModelValue<T> | undefined) ?? empty),
  );
  const [value, setValue] = useControllableState<SelectModelValue<T>, SelectChangeDetails>({
    value: valueProp,
    defaultValue: (defaultValue as SelectModelValue<T> | undefined) ?? empty,
    onChange: onValueChange
      ? (next, details) => {
          (onValueChange as (value: SelectModelValue<T>, details: SelectChangeDetails) => void)(next, details);
        }
      : undefined,
    name: '<Select.Root value>',
    cancelable: true,
  });
  const [open, setOpen] = useControllableState<boolean, SelectOpenChangeDetails>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange
      ? (next, details) => {
          onOpenChange(next, details.reason === 'blur' ? uncancelable(details) : details);
        }
      : undefined,
    name: '<Select.Root open>',
    cancelable: true,
  });
  return { value, setValue, mountValue, open, setOpen };
}
