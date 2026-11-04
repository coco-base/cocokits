'use client';

import { createContext, useContext, type Context, type RefObject } from 'react';
import type { FormFieldControlContext } from '@cocokits/machines/form-field';
import type { selectAnatomy, SelectEvent, SelectParts, SelectState } from '@cocokits/machines/select';
import type { ThemeAttrsByPart } from '@cocokits/shared';
import type { DismissHandlers } from '../internal/dismiss-handlers';
import type { SelectItemRegistration } from './select-item-registration';
import type { SelectTriggerHandlers } from './use-select-trigger';

/** The `aria-*` attributes the trigger was given; the list is named like the trigger. */
export interface SelectTriggerAria {
  readonly label: string | undefined;
  readonly labelledby: string | undefined;
  readonly describedby: string | undefined;
}

/** The Content handlers that can refuse a dismissal, read live by the Content's dismiss layer. */
export type SelectContentHandlers = Pick<DismissHandlers, 'onEscapeKeyDown' | 'onPointerDownOutside'>;

/** What the Root gives its trigger, its value, its list, its items and its groups. */
export interface SelectContextValue<T = unknown> {
  /** The state the machine reads, without the trigger's own `aria-*`. */
  readonly state: SelectState<T>;
  /** The props of every part, from the machine (the trigger is computed again by the trigger with its own `aria-*`). */
  readonly parts: SelectParts<T>;
  /** The id of the form the Select belongs to, for a native trigger. */
  readonly form: string | undefined;
  /** What the enclosing FormField gives the Select. */
  readonly field: FormFieldControlContext | undefined;
  /** The theme attributes of every part. */
  readonly theme: ThemeAttrsByPart<typeof selectAnatomy>;
  /** Whether the list is open. */
  readonly open: boolean;
  /** Whether the list must be rendered: open, or closed with its exit animation still running. */
  readonly keepMounted: boolean;
  /** The trigger element, `null` until it is attached. */
  readonly trigger: HTMLElement | null;
  /** The element the list lines up with: the FormField's input wrapper, else the trigger. */
  readonly anchor: HTMLElement | null;
  /** The list element, for the exit animation. */
  readonly contentRef: RefObject<HTMLDivElement | null>;
  /** Reports whether the list is in the document. */
  readonly setMounted: (mounted: boolean) => void;
  /** Sends a machine event; the Root decides the changes and reports them. `false` when a change was refused. */
  readonly dispatch: (event: SelectEvent) => boolean;
  /** The ref callback that attaches the trigger to the Root. */
  readonly setTriggerRef: (node: HTMLElement | null) => () => void;
  /** The handlers of the trigger. */
  readonly handlers: SelectTriggerHandlers;
  /** Tells the Root which `aria-*` the trigger was given. */
  readonly setTriggerAria: (aria: SelectTriggerAria) => void;
  /** Holds back the close a focus move would cause while an outside press is decided. */
  readonly holdFocusOut: (hold: boolean) => void;
  /** Whether the list's dismiss layer is active, so Escape reaches the Content handlers. */
  readonly layerActiveRef: RefObject<boolean>;
  /** The Content handlers, assigned by the Content. */
  readonly contentHandlersRef: RefObject<SelectContentHandlers>;
  /** Whether nothing is selected: the placeholder shows. */
  readonly empty: boolean;
  /** The value of the model, as the children function of the value part gets it. */
  readonly modelValue: unknown;
  /** The trigger text: the selected labels joined with `, `. */
  readonly valueText: string;
  /** Registers (or updates) an item; returns the function that removes it. */
  readonly registerItem: (item: SelectItemRegistration<T>) => () => void;
}

/** The context of the Root. */
export const SelectContext: Context<SelectContextValue | null> = createContext<SelectContextValue | null>(null);

/** The group around an item: its registration key (for the label id) and whether it is disabled. */
export interface SelectGroupContextValue {
  readonly key: string;
  readonly disabled: boolean;
}

/** The context of a group; `null` outside a group. */
export const SelectGroupContext: Context<SelectGroupContextValue | null> =
  createContext<SelectGroupContextValue | null>(null);

/** What an item gives its text part. */
export interface SelectItemContextValue {
  /** Tells the item which element holds its text; `null` on unmount. */
  readonly setTextElement: (element: HTMLElement | null) => void;
}

/** The context of an item; `null` outside an item. */
export const SelectItemContext: Context<SelectItemContextValue | null> = createContext<SelectItemContextValue | null>(
  null,
);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Select.Item`.
 * @returns The context.
 * @throws When the part is not inside a `Select.Root`.
 */
export function useSelectContext<T>(part: string): SelectContextValue<T> {
  const context = useContext(SelectContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Select.Root>.`);
  return context as SelectContextValue<T>;
}

/**
 * Reads the group around a part.
 *
 * @param part - The part that asks, for the error message.
 * @returns The group.
 * @throws When the part is not inside a `Select.Group`.
 */
export function useSelectGroup(part: string): SelectGroupContextValue {
  const group = useContext(SelectGroupContext);
  if (group === null) throw new Error(`CocoKits: <${part}> must be placed within <Select.Group>.`);
  return group;
}
