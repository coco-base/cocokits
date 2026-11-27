import { inject, type ComputedRef, type InjectionKey, type ShallowRef } from 'vue';
import type { Presence } from '@cocokits/cdk/presence';
import type { AccordionEvent, AccordionState } from '@cocokits/machines/accordion';

/** What an AccordionItem tells the root about itself: getters, so a change after mount is seen on the next read. */
export interface AccordionRegistration {
  /** The item value. */
  readonly value: () => string;
  /** Whether the item itself is disabled. */
  readonly disabled: () => boolean;
  /** The trigger element, `null` before it is mounted. */
  readonly trigger: () => HTMLElement | null;
  /** The content element, `null` before it is mounted. */
  readonly content: () => HTMLElement | null;
}

/** What an AccordionRoot gives its parts. */
export interface AccordionContextValue {
  /** The machine state; each part computes its own props from it. */
  readonly state: ComputedRef<AccordionState>;
  /** Sends a machine event of a trigger. */
  readonly dispatch: (event: AccordionEvent) => void;
  /** Whether the content of closed items is removed unless the item says otherwise. */
  readonly unmountOnHide: ComputedRef<boolean>;
  /** Registers an item; returns the function that unregisters it. */
  readonly register: (entry: AccordionRegistration) => () => void;
  /** Lists the registered items again: call it after a render that may have moved or changed one. */
  readonly refresh: () => void;
  /** Marks the trigger of this value as keyboard-focused when the last input was the keyboard. */
  readonly focusTrigger: (value: string) => void;
  /** Clears the keyboard-focus mark. */
  readonly blurTrigger: () => void;
}

/** What an AccordionItem gives its header, trigger and content. */
export interface AccordionItemContextValue {
  /** The item value. */
  readonly value: ComputedRef<string>;
  /** The SSR-stable id of the item. */
  readonly id: string;
  /** Whether the item is disabled by itself. */
  readonly disabled: ComputedRef<boolean>;
  /** Whether the item is open. */
  readonly open: ComputedRef<boolean>;
  /** Whether the content is still shown: open, or closing while its exit animation runs. */
  readonly shown: ComputedRef<boolean>;
  /** Whether the closed content removes its children. */
  readonly unmountOnHide: ComputedRef<boolean>;
  /** The trigger element, set by the trigger. */
  readonly trigger: ShallowRef<HTMLElement | null>;
  /** The content element, set by the content. */
  readonly content: ShallowRef<HTMLElement | null>;
  /** The presence of the content: the content drives it, the item reads `shown` from it. */
  readonly presence: Presence;
}

/** Injection key of the accordion context. Not exported from any entry point. */
export const ACCORDION_KEY: InjectionKey<AccordionContextValue> = Symbol('cck-accordion');
/** Injection key of the item context. Not exported from any entry point. */
export const ACCORDION_ITEM_KEY: InjectionKey<AccordionItemContextValue> = Symbol('cck-accordion-item');

/**
 * The context of the nearest AccordionRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside an AccordionRoot.
 */
export function useAccordionContext(part: string): AccordionContextValue {
  const context = inject(ACCORDION_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <AccordionRoot>.`);
  return context;
}

/**
 * The context of the nearest AccordionItem.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside an AccordionItem.
 */
export function useAccordionItemContext(part: string): AccordionItemContextValue {
  const context = inject(ACCORDION_ITEM_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <AccordionItem>.`);
  return context;
}
