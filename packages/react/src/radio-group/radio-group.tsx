'use client';

import {
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
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
import type { FormFieldControlContext } from '@cocokits/machines/form-field';
import { DirectionProvider, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { sortByDomOrder } from '@cocokits/utils';
import { composeEventHandlers } from '../internal/compose-event-handlers';
import { FormFieldContext, useFormFieldContext } from '../internal/form-field-context';
import { mergeProps } from '../internal/merge-props';
import {
  RadioGroupContext,
  type RadioGroupContextValue,
  type RadioGroupRegistration,
} from '../internal/radio-group-context';
import { renderElement } from '../internal/render-element';
import { useControlClaim, useControlReport } from '../internal/use-field-control';
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
  touched,
  form,
  orientation,
  loop = true,
  dir: dirProp,
  id: idProp,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  render,
  ref,
  children,
  ...rest
}: RadioGroupProps): ReactElement {
  const id = useId();
  const field = useFormFieldContext();
  const elementRef = useRef<HTMLElement | null>(null);
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
  // Set when the focus leaves the group; a `touched` you pass wins.
  const [touchedState, setTouchedState] = useState(false);
  // Set when a radio blocked a submit of the owner form; a form reset clears it.
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState<readonly RadioGroupItem[]>([]);
  const [mounted, setMounted] = useState(false);
  // A mutable set the radios fill in their layout effects; state, not a ref, so the key handler can read it.
  const [registry] = useState(() => new Set<() => RadioGroupRegistration>());
  const lastReset = useRef<Event | null>(null);

  const primary = useControlClaim(
    field,
    elementRef,
    'This group gets no generated id and no description from the field, and its state does not reach the field.',
  );
  const fieldContext = useMemo<FormFieldControlContext | undefined>(
    () => (field ? { ids: primary ? field.ids : undefined, state: field.own, hasLabel: field.hasLabel } : undefined),
    [field, primary],
  );

  const current = value ?? null;
  const machineState = useMemo<MachineState>(
    () => ({
      value: current,
      name,
      items,
      disabled,
      required,
      touched: touched ?? touchedState,
      submitted,
      form,
      orientation,
      loop,
      dir,
      mounted,
      id: idProp === '' ? undefined : idProp,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
    }),
    [
      current,
      name,
      items,
      disabled,
      required,
      touched,
      touchedState,
      submitted,
      form,
      orientation,
      loop,
      dir,
      mounted,
      idProp,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
    ],
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

  // `invalid` does not bubble: the group listens in the capture phase for a submit its radios blocked.
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const onInvalid = (): void => {
      setSubmitted(true);
    };
    element.addEventListener('invalid', onInvalid, true);
    return () => {
      element.removeEventListener('invalid', onInvalid, true);
    };
  }, []);

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
      setTouchedState(false);
      setSubmitted(false);
      setValue(mountValue, { reason: 'form-reset', event });
    },
    [setValue, mountValue],
  );

  // The rendered props send nothing; the key handler sends through `dispatch`.
  const parts = getRadioGroupProps(machineState, ignore, fieldContext);
  useControlReport(field, elementRef, primary, parts.control);
  const context = useMemo<RadioGroupContextValue>(
    () => ({
      value: current,
      facts: (item) => getRadioGroupProps(machineState, ignore, fieldContext).radio(item),
      setValue: (next, details) => {
        setValue(next, details);
      },
      reset,
      register,
      refresh,
    }),
    [machineState, fieldContext, current, setValue, reset, register, refresh],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const target = event.target;
    const focused = getRegistration((entry) => entry.element === target);
    getRadioGroupProps(machineState, dispatch, fieldContext).root.onKeyDown(event.nativeEvent, focused?.value);
  };

  const elementProp = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementProp, elementRef);
  const ours = { ...themeAttrs, ...toReactProps(parts.root), ref: mergedRef };
  // Only the author's own `dir` is rendered; keys and nested radios use the resolved one.
  const props = mergeProps(ours, {
    ...rest,
    onKeyDown: composeEventHandlers(rest.onKeyDown, onKeyDown),
    onBlur: composeEventHandlers(rest.onBlur, (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setTouchedState(true);
    }),
    dir: dirProp,
    children,
  }) as unknown as RadioGroupRenderProps;
  const state: RadioGroupState = {
    value: current,
    disabled: parts.control.disabled === true,
    required: parts.control.required === true,
    orientation,
  };
  return (
    <DirectionProvider dir={dir}>
      {/* Only the group is the control of the field, not a control inside it. */}
      <FormFieldContext.Provider value={null}>
        <RadioGroupContext.Provider value={context}>
          {renderElement<RadioGroupRenderProps, RadioGroupState>(render, 'div', props, state)}
        </RadioGroupContext.Provider>
      </FormFieldContext.Provider>
    </DirectionProvider>
  );
}

/** The {@link RadioGroup} component and its `displayName`. */
interface RadioGroupComponent {
  (props: RadioGroupProps): ReactElement;
  displayName: string;
}

/**
 * A set of radios with one value. It renders a `<div role="radiogroup">` around the `Radio` elements.
 *
 * Name the group. Inside a `FormField`, the `Label` of the field names it through `aria-labelledby`, and the `Hint`
 * and `FieldError` describe it. Alone, give it `aria-labelledby` or `aria-label`.
 *
 * The group is one tab stop: the checked radio, or else the first enabled radio. The arrow keys move the focus and
 * the check to the next or previous enabled radio.
 *
 * The arrow keys wrap with `loop`, and `orientation` limits them to one axis. In `rtl`, Left and Right swap. The
 * browser handles Home, End, Page Up and Page Down.
 *
 * Control the value with `value` and `onValueChange`, or set `defaultValue` and let the group keep it. A change
 * that you do not take is undone in the inputs.
 *
 * Each Radio takes its checked state, `name`, `disabled`, `required` and tab stop from the group. The group knows
 * a Radio by its `value`.
 *
 * A `required` group with no value gets `aria-invalid="true"` and `data-invalid` only after the user has left it.
 * A `touched` of `true` or a blocked submit shows them too. A form reset clears what the group tracked.
 *
 * The radios are native inputs, so `FormData` holds the value of the checked radio. A form reset restores the
 * value that the group had at mount.
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
