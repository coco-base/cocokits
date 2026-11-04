'use client';

import {
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type Ref,
  type RefObject,
} from 'react';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import { formFieldStateAttrs } from '@cocokits/machines/form-field';
import {
  getSelectProps,
  getSelectValueText,
  isSelectEmpty,
  selectAnatomy,
  transitionSelect,
  valueToFormString,
  type SelectEvent,
  type SelectParts,
  type SelectState,
} from '@cocokits/machines/select';
import {
  DirectionProvider,
  toReactProps,
  useDirection,
  useFormParticipation,
  useThemeAttrs,
} from '@cocokits/react-core';
import { hasAccessibleName } from '@cocokits/utils';
import { isDevelopment } from '../internal/dev';
import { useFormFieldContext } from '../internal/form-field-context';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useControlClaim, useControlReport } from '../internal/use-field-control';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import {
  SelectContext,
  type SelectContentHandlers,
  type SelectContextValue,
  type SelectTriggerAria,
} from './select-context';
import { applySelectTransition } from './select-dispatch';
import { SelectFormInputs } from './select-form-inputs';
import { findCandidate, normalizeItems } from './select-items';
import { SelectNativeError } from './select-native-error';
import type { SelectRenderProps, SelectRootComponent, SelectRootProps } from './select.types';
import { useSelectHighlight } from './use-select-highlight';
import { useSelectModel } from './use-select-model';
import { useSelectPresence } from './use-select-presence';
import { useSelectRegistry } from './use-select-registry';
import { useSelectTrigger } from './use-select-trigger';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/**
 * What the root does not pass on: the attributes the machine owns, which a consumer value can never replace,
 * and the model props, which `useSelectModel` reads.
 */
const RESERVED = [
  ...formFieldStateAttrs,
  'data-state',
  'data-multiple',
  'data-placeholder-shown',
  'id',
  'value',
  'defaultValue',
  'onValueChange',
  'open',
  'defaultOpen',
  'onOpenChange',
];

/**
 * Computes the props of every part. A hook, so that the React compiler lint sees the `dispatch` it receives as
 * a plain argument: the Root keeps the latest state in a ref and `dispatch` reads it only when an event runs.
 */
function useSelectParts<T>(
  state: SelectState<T>,
  dispatch: (event: SelectEvent) => boolean,
  field: Parameters<typeof getSelectProps<T>>[2],
): SelectParts<T> {
  return getSelectProps<T>(state, dispatch, field);
}

/** What the enclosing FormField gives the Select: the ids only while it is the field's control. */
function fieldContextOf(
  field: ReturnType<typeof useFormFieldContext>,
  primary: boolean,
): Parameters<typeof getSelectProps>[2] {
  return field ? { ids: primary ? field.ids : undefined, state: field.own } : undefined;
}

/** Whether the Select reacts to the user: not disabled and not read-only, by itself or by its field. */
function isInteractive(
  disabled: boolean,
  readOnly: boolean | undefined,
  field: ReturnType<typeof useFormFieldContext>,
): boolean {
  return ![disabled, readOnly, field?.own.disabled, field?.own.readOnly].some(Boolean);
}

/** Warns in development about a Select that has no accessible name, after the Label's `for` has committed. */
function useNameWarning(triggerRef: RefObject<HTMLElement | null>, inField: boolean): void {
  useEffect(() => {
    if (!isDevelopment()) return undefined;
    const frame = requestAnimationFrame(() => {
      if (triggerRef.current && !hasAccessibleName(triggerRef.current)) {
        console.warn(
          `CocoKits: a Select ${inField ? 'in a FormField ' : ''}has no accessible name. Add a Label to the FormField, or an aria-label or aria-labelledby to the Select.Trigger.`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [triggerRef, inField]);
}

const NO_ARIA: SelectTriggerAria = { label: undefined, labelledby: undefined, describedby: undefined };

function SelectRootImpl<T = string, M extends boolean = false>(props: SelectRootProps<T, M>): ReactElement {
  const {
    multiple,
    items,
    itemToStringLabel,
    itemToStringValue,
    isItemEqualToValue,
    autoComplete,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    form,
    dir,
    ref,
    render,
    children,
    ...rest
  } = props;
  const isMultiple = multiple === true;
  const id = useId();
  const inherited = useDirection();
  // The browser's message after a blocked submit; the trigger takes the focus then, which hides its bubble.
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const field = useFormFieldContext();
  const theme = useThemeAttrs(selectAnatomy);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [typeahead] = useState(() => createTypeahead());
  const model = useSelectModel<T, M>(props);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [triggerAria, setTriggerAriaState] = useState<SelectTriggerAria>(NO_ARIA);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  // An outside press is being decided, and whether the list's dismiss layer answers Escape.
  const focusOutHeld = useRef(false);
  const layerActiveRef = useRef(false);
  const contentHandlersRef = useRef<SelectContentHandlers>({});

  const primary = useControlClaim(
    field,
    triggerRef,
    'This Select gets no generated id and no description from the field, and its state does not reach the field.',
  );
  const { setValue, mountValue } = model;
  const participation = useFormParticipation({
    elementRef: triggerRef,
    getValue: () => triggerRef.current?.value ?? '',
    onReset: (event) => {
      setTouched(false);
      setDirty(false);
      setBlockedMessage(null);
      setValue(mountValue, { reason: 'form-reset', event });
    },
  });

  const isDisabled = disabled === true || participation.fieldsetDisabled;
  const interactive = isInteractive(isDisabled, readOnly, field);
  const isOpen = model.open && interactive;
  const registry = useSelectRegistry<T | null>(isOpen);
  const presence = useSelectPresence(isOpen);

  const entries = normalizeItems(items);
  const same = (a: T | null, b: T | null): boolean =>
    isItemEqualToValue && a !== null && b !== null ? isItemEqualToValue(a, b) : Object.is(a, b);
  // The trigger text of a value: its `items` label, else `itemToStringLabel`, else `String`. No item registers it.
  const labelOf = (value: T | null): string => {
    const entry = entries.find((candidate) => same(candidate.value, value));
    if (entry) return entry.label;
    return itemToStringLabel && value !== null ? itemToStringLabel(value) : String(value);
  };

  const baseState: SelectState<T | null> = {
    id,
    open: isOpen,
    mounted: presence.mounted,
    items: registry.items,
    value: model.value,
    multiple: isMultiple,
    itemToStringLabel: labelOf,
    itemToStringValue: itemToStringValue as ((value: T | null) => string) | undefined,
    isItemEqual: same,
    labelledBy: triggerAria.labelledby,
    ariaLabel: triggerAria.label,
    typeahead,
    ariaDescribedBy: triggerAria.describedby,
    name,
    disabled: isDisabled,
    readOnly,
    required,
    invalid,
    touched,
    dirty,
    submitted: participation.submitted,
    blockedSubmit: blockedMessage !== null,
    focused,
  };
  const highlight = useSelectHighlight({ isOpen, registry: registry.registry, state: baseState });
  const state: SelectState<T | null> = { ...baseState, highlighted: isOpen ? highlight.highlighted : undefined };

  // Read by `dispatch`, which the dismissal listeners created once call.
  const latest = useRef({ state, model });
  useIsomorphicLayoutEffect(() => {
    latest.current = { state, model };
  });
  const { begin, set: setHighlight, reveal } = highlight;
  const dispatch = useCallback(
    (event: SelectEvent): boolean => {
      const { state: current, model: currentModel } = latest.current;
      const next = transitionSelect(current, event);
      if (!next) return true;
      return applySelectTransition(next, event, currentModel, {
        changed: () => {
          setDirty(true);
          setBlockedMessage(null);
        },
        begin: (sent) => {
          begin(sent.type === 'TRIGGER.OPEN' ? sent.initial : 'selected');
        },
        highlight: setHighlight,
        reveal,
      });
    },
    [begin, setHighlight, reveal],
  );

  const parts = useSelectParts(state, dispatch, fieldContextOf(field, primary));
  useControlReport(field, triggerRef, primary, parts.control);

  // A trigger rendered as another element (`nativeButton={false}`) has no form value; it is read as a button.
  const setTriggerRef = useCallback((element: HTMLElement | null): (() => void) => {
    const node = element as HTMLButtonElement | null;
    triggerRef.current = node;
    setTrigger(node);
    return () => {
      triggerRef.current = null;
      setTrigger(null);
    };
  }, []);
  const setTriggerAria = useCallback((aria: SelectTriggerAria) => {
    setTriggerAriaState((current) =>
      current.label === aria.label && current.labelledby === aria.labelledby && current.describedby === aria.describedby
        ? current
        : aria,
    );
  }, []);
  const holdFocusOut = useCallback((hold: boolean) => {
    focusOutHeld.current = hold;
  }, []);
  const handlers = useSelectTrigger({
    trigger: parts.trigger,
    element: trigger,
    elementRef: triggerRef,
    isOpen,
    interactive,
    itemCount: registry.items.length,
    typeahead,
    dispatch,
    isFocusOutHeld: () => focusOutHeld.current,
    isLayerActive: () => layerActiveRef.current,
    begin,
    onFocusChange: setFocused,
    onTouched: () => {
      setTouched(true);
    },
  });

  useEffect(
    () => () => {
      typeahead.reset();
    },
    [typeahead],
  );
  useNameWarning(triggerRef, field !== null);

  const onInvalid = (message: string): void => {
    setBlockedMessage(message);
    // The browser focuses the invalid input right after the event, so the trigger takes the focus back after it.
    triggerRef.current?.focus();
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  };

  // A browser autofill wrote to the hidden input of a single Select: it picks the enabled item whose form string it
  // is. The mounted items are the candidates while the list is open, the `items` data while it is closed. Without
  // a match, or in a multiple Select, the input shows the current value again.
  const onFill = (written: string, event: Event): void => {
    if (isMultiple || !interactive || written === '') return;
    const candidates =
      registry.registry.length > 0
        ? registry.registry.map((item) => ({ value: item.value, disabled: item.disabled }))
        : entries.map((entry) => ({ value: entry.value, disabled: entry.disabled === true }));
    const match = findCandidate(candidates, written, (value) => valueToFormString(state, value));
    if (!match || (model.value !== null && same(model.value as T, match.value))) return;
    setDirty(true);
    setBlockedMessage(null);
    model.setValue(match.value, { reason: 'user', event });
  };

  const empty = isSelectEmpty(state);
  const valueText = getSelectValueText(state);
  // Not memoized: `parts` holds the handlers of the current state and is a new object on every render, so the
  // trigger, the items and the list follow each render of the Root.
  const context: SelectContextValue<T | null> = {
    state,
    parts,
    form,
    field: fieldContextOf(field, primary),
    theme,
    open: isOpen,
    keepMounted: presence.keepMounted,
    trigger,
    anchor: (primary ? field?.inputWrapper : null) ?? trigger,
    contentRef: presence.contentRef,
    setMounted: presence.setMounted,
    dispatch,
    setTriggerRef,
    handlers,
    setTriggerAria,
    holdFocusOut,
    layerActiveRef,
    contentHandlersRef,
    empty,
    modelValue: model.value,
    valueText,
    registerItem: registry.registerItem,
  };
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const rootRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const rootProps = mergeProps(
    { ...theme.root, ...toReactProps(parts.root), ...(dir ? { dir } : {}), ref: rootRef },
    withoutReserved(rest, RESERVED),
  ) as unknown as SelectRenderProps;

  const inner = (
    <>
      {children}
      <SelectNativeError part={parts.validationMessage} message={blockedMessage} />
      <SelectFormInputs
        input={parts.formInput}
        multiple={isMultiple}
        form={form}
        autoComplete={autoComplete}
        onInvalid={onInvalid}
        onFill={onFill}
      />
    </>
  );

  return (
    <DirectionProvider dir={dir ?? inherited}>
      <SelectContext value={context as unknown as SelectContextValue}>
        {renderElement<SelectRenderProps, undefined>(render, 'div', { ...rootProps, children: inner }, undefined)}
      </SelectContext>
    </DirectionProvider>
  );
}

/**
 * Renders the Select root: a `<div>` (or your `render` element) that holds the parts, the hidden form inputs and
 * the message of a blocked submit, and provides the value and the open state to them. Write the parts inside it: a
 * `Select.Trigger` with a `Select.Value` and a `Select.Icon`, and a `Select.Content` with `Select.Item`s. It is a
 * custom listbox, not a native `<select>`. The items mount with the list, so the list renders nothing while
 * closed, on the server and in the first client render.
 *
 * The value is a `T` or `null` (a list of `T` with `multiple`), controlled with `value` and `onValueChange` or
 * uncontrolled with `defaultValue`. `T` is `string` unless the items carry something else, and then `items`,
 * `itemToStringLabel`, `itemToStringValue` and `isItemEqualToValue` tell the Select how to show, submit and
 * compare it. `onValueChange` and `onOpenChange` can refuse a change with `details.cancel()`. In a single Select an
 * item whose value is `null` or `''` clears the value and shows the placeholder. With `name` (or `required`) it
 * renders hidden native inputs, so `FormData`, constraint validation, `form`, a form reset and a browser autofill
 * work.
 *
 * Inside a `FormField` the trigger is the field's control (`<fieldId>-control`) and the list lines up with the
 * field's input wrapper. Name the Select with the field's label, or `aria-label` or `aria-labelledby` on the
 * trigger. Native div props pass through to the root element.
 *
 * @example
 * <Select.Root onValueChange={(dish) => setDish(dish)}>
 *   <Select.Trigger aria-label="Dish">
 *     <Select.Value placeholder="Choose a dish" />
 *     <Select.Icon />
 *   </Select.Trigger>
 *   <Select.Content>
 *     <Select.Item value="Cake"><Select.ItemIndicator /><Select.ItemText>Cake</Select.ItemText></Select.Item>
 *     <Select.Item value="Pizza"><Select.ItemIndicator /><Select.ItemText>Pizza</Select.ItemText></Select.Item>
 *   </Select.Content>
 * </Select.Root>
 * @typeParam T - The type of an item's value. Defaults to `string`.
 * @typeParam M - The type of `multiple`: `true` makes the value a list. Defaults to `false`.
 * @cckPart root
 * @param props - The Root props.
 * @returns The rendered root.
 */
export const SelectRoot: SelectRootComponent = Object.assign(SelectRootImpl, { displayName: 'Select.Root' });
