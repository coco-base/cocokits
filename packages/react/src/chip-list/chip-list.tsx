'use client';

import {
  isValidElement,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';
import {
  addChipListValue,
  chipListAnatomy,
  getChipListBackspaceTarget,
  getChipListFocusAfterRemove,
  getChipListProps,
  getChipListRemoveKey,
  isChipListAddKey,
  removeChipListValue,
  toggleChipListItem,
  type ChipListEntry,
} from '@cocokits/machines/chip-list';
import { formFieldStateAttrs } from '@cocokits/machines/form-field';
import { toReactProps, useFormParticipation, useThemeAttrs } from '@cocokits/react-core';
import { Chip } from '../chip';
import { useFormFieldContext } from '../internal/form-field-context';
import { FormHiddenInputs } from '../internal/form-hidden-inputs';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderContainerRoot } from '../internal/render-container-root';
import { useControllableState } from '../internal/use-controllable-state';
import { useControlClaim, useControlReport } from '../internal/use-field-control';
import { useControlHandle } from '../internal/use-control-handle';
import { useMergedRef } from '../internal/use-merged-ref';
import { useUnnamedWarning } from '../internal/use-unnamed-warning';
import type { ChipListChangeDetails, ChipListProps, ChipListRenderProps } from './chip-list.types';
import { useChipListFocus } from './use-chip-list-focus';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = [...formFieldStateAttrs];

const NO_VALUES: readonly ChipListEntry[] = [];

const NAME_FIX =
  'Put the list in a FormField with a Label, or add an aria-label, or an aria-labelledby that points to an element with text.';

function ChipListImpl({
  value,
  defaultValue,
  onValueChange,
  name,
  form,
  addOnBlur = false,
  placeholder,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  disabled,
  readOnly,
  required,
  hidden,
  invalid,
  pending,
  touched,
  dirty,
  submitted,
  render,
  ref,
  ...rest
}: ChipListProps): ReactElement {
  const themeAttrs = useThemeAttrs(chipListAnatomy);
  const field = useFormFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const elementRef = isValidElement<{ ref?: Ref<HTMLElement> }>(render) ? render.props.ref : undefined;
  const rootElement = useRef<HTMLElement | null>(null);
  const [mountValue] = useState(() => value ?? defaultValue ?? NO_VALUES);
  const [list, setList] = useControllableState<readonly ChipListEntry[], ChipListChangeDetails>({
    value,
    defaultValue: defaultValue ?? NO_VALUES,
    onChange: onValueChange,
    name: 'ChipList value',
  });
  const [draft, setDraft] = useState('');
  const draftRef = useRef('');
  const [focused, setFocused] = useState(false);
  const [touchedState, setTouchedState] = useState(false);
  const [dirtyState, setDirtyState] = useState(false);
  // A blocked submit: the browser found a hidden input invalid. The list then counts as invalid and submitted.
  const [blocked, setBlocked] = useState(false);
  const primary = useControlClaim(
    field,
    inputRef,
    'This list gets no generated id and no description from the field, and its state does not reach the field.',
  );

  const updateDraft = (text: string): void => {
    draftRef.current = text;
    setDraft(text);
  };

  const participation = useFormParticipation({
    elementRef: inputRef,
    getValue: () => draftRef.current,
    onReset: (event) => {
      updateDraft('');
      setTouchedState(false);
      setDirtyState(false);
      setBlocked(false);
      setList(mountValue, { reason: 'form-reset', event });
    },
  });

  // Clears the facts the list tracks. The values and the text stay, and nobody is told about a change.
  const reset = (): void => {
    setTouchedState(false);
    setDirtyState(false);
    setBlocked(false);
    participation.clearSubmitted();
  };
  const handleRef = useControlHandle({
    reset,
    focus: () => {
      inputRef.current?.focus();
    },
  });
  const rootRef = useMergedRef<HTMLElement>(
    ref,
    elementRef,
    useMergedRef<HTMLElement>(rootElement, handleRef, undefined),
  );

  const parts = getChipListProps(
    {
      value: list,
      draft,
      placeholder,
      id,
      ariaDescribedBy,
      name,
      disabled: disabled === true || participation.fieldsetDisabled,
      readOnly,
      required,
      invalid: invalid === true || blocked,
      pending,
      touched: touched ?? touchedState,
      dirty: dirty ?? dirtyState,
      submitted: (submitted ?? participation.submitted) || blocked,
      focused,
      hidden,
    },
    field ? { ids: primary ? field.ids : undefined, state: field.own } : undefined,
  );
  useControlReport(field, inputRef, primary, parts.control);
  useUnnamedWarning('ChipList', inputRef, {
    level: 'error',
    fix: NAME_FIX,
    key: [ariaLabel, ariaLabelledBy].join('|'),
  });

  const focus = useChipListFocus(
    inputRef,
    rootElement,
    parts.control.readOnly === true && parts.control.disabled !== true,
  );

  const add = (text: string, event: Event): void => {
    updateDraft('');
    const next = addChipListValue(list, text);
    if (next === list) return;
    setDirtyState(true);
    setBlocked(false);
    setList(next, { reason: 'add', event });
  };

  const remove = (index: number): void => {
    const event = focus.takeActivation();
    focus.focusInput();
    const next = removeChipListValue(list, index);
    if (next === list) return;
    setDirtyState(true);
    setBlocked(false);
    setList(next, { reason: 'remove', event });
  };

  const toggle = (index: number, event: Event | null): void => {
    const next = toggleChipListItem(list, index);
    if (next === list) return;
    setDirtyState(true);
    setList(next, { reason: 'toggle', event });
  };

  // Backspace or Delete on a chip removes it and moves the focus to a neighbour chip, else to the text box.
  const onChipKeyDown = (index: number, event: KeyboardEvent<HTMLElement>): void => {
    const key = getChipListRemoveKey(event.nativeEvent);
    if (key === null || !(event.target instanceof HTMLButtonElement)) return;
    const next = removeChipListValue(list, index);
    if (next === list) return;
    event.preventDefault();
    setDirtyState(true);
    setBlocked(false);
    focus.focusAfterCommit(getChipListFocusAfterRemove(list, index, key));
    setList(next, { reason: 'remove', event: event.nativeEvent });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const text = event.currentTarget.value;
    const last = getChipListBackspaceTarget(event.nativeEvent, text, list);
    if (last !== null) {
      event.preventDefault();
      focus.focusChip(last);
      return;
    }
    if (!isChipListAddKey(event.nativeEvent) || parts.chipDisabled || text.trim() === '') return;
    event.preventDefault();
    add(text, event.nativeEvent);
  };

  const onInputBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const text = event.currentTarget.value;
    if (addOnBlur && !parts.chipDisabled && text.trim() !== '') add(text, event.nativeEvent);
  };

  const onInvalid = (): void => {
    setBlocked(true);
    // The browser focuses the invalid input right after the event, so the text box takes the focus back after it.
    focus.focusInput();
    setTimeout(focus.focusInput, 0);
  };

  const root = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      ref: rootRef,
      onClickCapture: (event: { nativeEvent: Event }) => {
        focus.rememberActivation(event.nativeEvent);
      },
      onFocus: () => {
        setFocused(true);
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setFocused(false);
        setTouchedState(true);
      },
      children: (
        <>
          {list.map((entry, index) => {
            const chip = parts.chip(entry);
            return (
              // The chips are tracked by position, so a value with equal texts renders without a warning.
              <Chip
                key={index}
                removable={chip.removable}
                disabled={chip.disabled}
                selected={chip.selected}
                onSelectedChange={(_selected, details) => {
                  toggle(index, details.event);
                }}
                onRemove={() => {
                  remove(index);
                }}
                onKeyDown={(event) => {
                  onChipKeyDown(index, event);
                }}
                onFocus={(event) => {
                  if (event.target !== event.currentTarget) focus.rememberFocus(event.target);
                }}
                onBlur={(event) => {
                  focus.forgetFocus(event.target, event.relatedTarget);
                }}
              >
                {chip.value}
              </Chip>
            );
          })}
          <input
            {...themeAttrs.input}
            {...toReactProps(parts.input)}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              updateDraft(event.currentTarget.value);
            }}
            onKeyDown={onKeyDown}
            onBlur={onInputBlur}
          />
          <FormHiddenInputs input={parts.formInput} multiple form={form} onInvalid={onInvalid} />
        </>
      ),
    },
    withoutReserved(rest, RESERVED),
  ) as unknown as ChipListRenderProps;
  return renderContainerRoot<ChipListRenderProps, undefined>(render, root, undefined);
}

/** The {@link ChipList} component and its `displayName`. */
interface ChipListComponent {
  (props: ChipListProps): ReactElement;
  displayName: string;
}

/**
 * A text box for several values. Each text that the user types and confirms with Enter becomes a removable chip in
 * front of the text box. It renders a `<div>` that holds one `Chip` per value, a native `<input type="text">`, and
 * hidden inputs for forms.
 *
 * The list has no role. A screen reader reads each chip text, then its remove button, then the text box. Enter adds
 * the text after trimming it, unless the list has it already. Enter with no text submits the form as usual. Tab
 * reaches each remove button, then the text box. After a click on a remove button, focus moves to the text box.
 *
 * An entry is a string, or a `ChipListItem` with `removable: false` (no remove button), `disabled` and `selected`.
 * An item with `selected` set is a selectable chip: a press toggles it and reports the change with the reason
 * `toggle`. Backspace in the empty text box moves focus to the last chip. Backspace or Delete on a focused chip
 * removes it and moves focus to the previous chip (Delete: the next), else to the text box.
 *
 * Control the values with `value` and `onValueChange`, or set `defaultValue` and let the list keep them. A change
 * that you do not take is undone.
 *
 * It takes part in native forms. With `name`, `FormData` has one entry per chip, and `form` ties them to another
 * form. With `required`, the form does not submit while the list is empty. A form reset restores the start values.
 *
 * Inside a `FormField`, the text box is the control of the field. The `Label` names it, and the hints and errors
 * of the field describe it. Outside a `FormField`, give it `aria-label` or `aria-labelledby`.
 *
 * The facts of the list are `data-*` attributes on the root. The text box gets `aria-invalid="true"` only while the
 * list is not valid and the user has left it or tried to submit.
 *
 * @example
 * <ChipList aria-label="Toppings" name="toppings" defaultValue={['Pizza']} placeholder="Add a topping" />
 * @cckPart root
 * @cckPart input
 * @param props - The ChipList props.
 * @returns The rendered list.
 */
export const ChipList: ChipListComponent = Object.assign(ChipListImpl, { displayName: 'ChipList' });
