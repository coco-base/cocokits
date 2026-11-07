'use client';

import {
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';
import {
  getRadioGroupProps,
  radioGroupAnatomy,
  transitionRadioGroup,
  type RadioGroupEvent,
  type RadioGroupItem,
  type RadioGroupState as MachineState,
} from '@cocokits/machines/radio-group';
import { DirectionProvider, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { sortByDomOrder } from '@cocokits/utils';
import { composeEventHandlers } from '../internal/compose-event-handlers';
import { mergeProps } from '../internal/merge-props';
import {
  RadioGroupContext,
  type RadioGroupContextValue,
  type RadioGroupRegistration,
} from '../internal/radio-group-context';
import { renderElement } from '../internal/render-element';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import type {
  RadioGroupChangeDetails,
  RadioGroupProps,
  RadioGroupRenderProps,
  RadioGroupState,
} from './radio-group.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

const sameItems = (a: readonly RadioGroupItem[], b: readonly RadioGroupItem[]): boolean =>
  a.length === b.length &&
  a.every(
    (item, index) =>
      item.value === b[index]?.value &&
      item.disabled === b[index]?.disabled &&
      item.required === b[index]?.required &&
      item.form === b[index]?.form,
  );

/** The rendered props send nothing: the key handler sends through `dispatch`. */
const ignore = (): void => undefined;

function RadioGroupImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  name: nameProp,
  disabled = false,
  required = false,
  form,
  orientation,
  loop = true,
  dir: dirProp,
  render,
  ref,
  children,
  ...rest
}: RadioGroupProps): ReactElement {
  const id = useId();
  const inherited = useDirection();
  const dir = dirProp ?? inherited;
  const themeAttrs = useThemeAttrs(radioGroupAnatomy).root;
  const name = nameProp === undefined || nameProp === '' ? `cck-radio-group-${id}` : nameProp;
  // What a form reset restores: the value at mount.
  const [mountValue] = useState<string | null>(() => (valueProp !== undefined ? valueProp : (defaultValue ?? null)));
  const [value, setValue] = useControllableState<string | null | undefined, RadioGroupChangeDetails>({
    value: valueProp,
    defaultValue: mountValue,
    onChange: (next, details) => {
      onValueChange?.(next ?? null, details);
    },
    name: '<RadioGroup value>',
  });
  const [items, setItems] = useState<readonly RadioGroupItem[]>([]);
  const [mounted, setMounted] = useState(false);
  // A mutable set the radios fill in their layout effects; state, not a ref, so the key handler can read it.
  const [registry] = useState(() => new Set<() => RadioGroupRegistration>());
  const lastReset = useRef<Event | null>(null);

  const current = value ?? null;
  const machineState = useMemo<MachineState>(
    () => ({ value: current, name, items, disabled, required, form, orientation, loop, dir, mounted }),
    [current, name, items, disabled, required, form, orientation, loop, dir, mounted],
  );

  const getRegistration = (match: (entry: RadioGroupRegistration) => boolean): RadioGroupRegistration | undefined => {
    for (const read of registry) {
      const entry = read();
      if (match(entry)) return entry;
    }
    return undefined;
  };

  // The registered radios in document order. Set only when it differs, so it never loops.
  const refresh = useCallback((): void => {
    const registrations = [...registry].map((read) => read());
    const byElement = new Map(
      registrations.flatMap((entry) => (entry.element ? [[entry.element, entry] as const] : [])),
    );
    const ordered = sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
    const next = ordered.map((entry): RadioGroupItem => ({
      value: entry.value,
      disabled: entry.disabled,
      required: entry.required,
      form: entry.form,
    }));
    setItems((previous) => (sameItems(previous, next) ? previous : next));
  }, [registry]);

  const register = useCallback(
    (read: () => RadioGroupRegistration): (() => void) => {
      registry.add(read);
      refresh();
      return () => {
        registry.delete(read);
        refresh();
      };
    },
    [registry, refresh],
  );

  // After every commit: a moved or re-enabled radio changes no state the group tracks. The radios register
  // first, so `mounted` turns on once they are known.
  useIsomorphicLayoutEffect(() => {
    refresh();
    setMounted(true);
  });

  // The click runs the native check and `change`, the same path as a pointer.
  const dispatch = (event: RadioGroupEvent): void => {
    const result = transitionRadioGroup(machineState, event);
    const element = (target: string | undefined): HTMLInputElement | undefined =>
      target === undefined ? undefined : (getRegistration((entry) => entry.value === target)?.element ?? undefined);
    element(result.focus)?.focus();
    element(result.activate)?.click();
  };

  const reset = useCallback(
    (event: Event | null): void => {
      // Every radio of the group reports the same reset; the group answers it once.
      if (event !== null && lastReset.current === event) return;
      lastReset.current = event;
      setValue(mountValue, { reason: 'form-reset', event });
    },
    [setValue, mountValue],
  );

  // The rendered props send nothing; the key handler sends through `dispatch`.
  const parts = getRadioGroupProps(machineState, ignore);
  const context = useMemo<RadioGroupContextValue>(
    () => ({
      value: current,
      facts: (item) => getRadioGroupProps(machineState, ignore).radio(item),
      setValue: (next, details) => {
        setValue(next, details);
      },
      reset,
      register,
      refresh,
    }),
    [machineState, current, setValue, reset, register, refresh],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const target = event.target;
    const focused = getRegistration((entry) => entry.element === target);
    getRadioGroupProps(machineState, dispatch).root.onKeyDown(event.nativeEvent, focused?.value);
  };

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const ours = { ...themeAttrs, ...toReactProps(parts.root), ref: mergedRef };
  // Only the author's own `dir` is rendered; keys and nested radios use the resolved one.
  const props = mergeProps(ours, {
    ...rest,
    onKeyDown: composeEventHandlers(rest.onKeyDown, onKeyDown),
    dir: dirProp,
    children,
  }) as unknown as RadioGroupRenderProps;
  const state: RadioGroupState = { value: current, disabled, required, orientation };
  return (
    <DirectionProvider dir={dir}>
      <RadioGroupContext.Provider value={context}>
        {renderElement<RadioGroupRenderProps, RadioGroupState>(render, 'div', props, state)}
      </RadioGroupContext.Provider>
    </DirectionProvider>
  );
}

/** The {@link RadioGroup} component and its `displayName`. */
interface RadioGroupComponent {
  (props: RadioGroupProps): ReactElement;
  displayName: string;
}

/**
 * Renders the `<div role="radiogroup">` around a set of `Radio` components that share one value. The
 * group is one tab stop: the checked radio, else the first enabled one. The arrow keys move the focus and the
 * check to the next or previous enabled radio, wrapping with `loop`, limited by `orientation` and flipped
 * for Left and Right in `rtl`; Home, End, Page Up and Page Down are left to the browser.
 *
 * Uncontrolled with `defaultValue`, or controlled with `value` and `onValueChange`; a change the parent
 * rejects is written back to the inputs. Inside the group each Radio takes its checked state, `name`,
 * `disabled`, `required` and tab stop from the group and reports no change of its own; a Radio identifies
 * itself by its `value`. The radios are native inputs, so `FormData` holds the checked radio's value and a
 * reset of the owner form restores the value the group had at mount (reason `'form-reset'`, only when the value
 * changes). Name the group with `aria-labelledby` or `aria-label`.
 *
 * @example
 * <span id="plan-label">Plan</span>
 * <RadioGroup aria-labelledby="plan-label" defaultValue="free">
 *   <Radio value="free">Free</Radio>
 *   <Radio value="pro">Pro</Radio>
 * </RadioGroup>
 * @cckPart root
 * @param props - The RadioGroup props.
 * @returns The rendered element inside the providers.
 */
export const RadioGroup: RadioGroupComponent = Object.assign(RadioGroupImpl, { displayName: 'RadioGroup' });
