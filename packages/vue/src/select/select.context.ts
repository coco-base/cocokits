import {
  inject,
  provide,
  type ComponentPublicInstance,
  type ComputedRef,
  type InjectionKey,
  type ShallowRef,
} from 'vue';
import type { SelectEvent, SelectParts } from '@cocokits/machines/select';

/** What an item tells the Root about itself. */
export interface SelectItemRegistration<T> {
  /** The registration key, never derived from the value. */
  readonly key: string;
  /** The item element. */
  readonly element: HTMLElement;
  /** The item's value. */
  readonly value: T;
  /** Whether the item, or its group, is disabled. */
  readonly disabled: boolean;
  /** The item's own `id`, read when used. */
  readonly id: string | undefined;
  /** The text type-to-search matches: the `textValue`, else the text of the `SelectItemText`; read when used. */
  readonly text: string | undefined;
  /**
   * Runs the item's `select` listeners before the item is chosen.
   *
   * @param event - The event that chooses the item.
   * @returns Whether a listener refused the choice.
   */
  readonly select: (event: Event) => boolean;
}

/** The `aria-*` attributes the trigger was given; the list is named like the trigger. */
export interface SelectTriggerAria {
  readonly label: string | undefined;
  readonly labelledby: string | undefined;
  readonly describedby: string | undefined;
}

/** What the trigger needs from the Root to handle its events. */
export interface SelectTriggerHandlers {
  readonly onClick: (event: MouseEvent) => void;
  readonly onKeydown: (event: KeyboardEvent) => void;
  readonly onKeyup: (event: KeyboardEvent) => void;
  readonly onFocus: () => void;
  readonly onBlur: (event: FocusEvent) => void;
}

/** What a SelectRoot gives its parts. */
export interface SelectContextValue<T = unknown> {
  /** The props of every part, from the machine. */
  readonly parts: ComputedRef<SelectParts<T>>;
  /** Whether the list is open. */
  readonly open: ComputedRef<boolean>;
  /** Whether the list is in the document: open, or closed with its exit animation still running. */
  readonly mounted: ShallowRef<boolean>;
  /** The trigger element; `null` until it mounted. */
  readonly triggerElement: ShallowRef<HTMLElement | null>;
  /** Makes the element of this trigger instance the live `triggerElement`; `null` on unmount. */
  readonly followTrigger: (instance: ComponentPublicInstance | null) => void;
  /** The element the list lines up with: the FormField's input wrapper, else the trigger. */
  readonly anchorElement: ComputedRef<HTMLElement | null>;
  /** The list element; `null` while it is not rendered. */
  readonly contentElement: ShallowRef<HTMLElement | null>;
  /** Whether the list is force-mounted, closed and finished its exit: it stays in the document, hidden. */
  readonly keptClosed: ShallowRef<boolean>;
  /** Whether a dismiss layer of the list is active, so Escape reaches the Content emits. */
  readonly layerActive: ShallowRef<boolean>;
  /** The `multiple` fact. */
  readonly multiple: ComputedRef<boolean>;
  /** The `form` of the Select, for a native trigger. */
  readonly form: ComputedRef<string | undefined>;
  /** Whether nothing is selected: the placeholder shows. */
  readonly empty: ComputedRef<boolean>;
  /** The value of the model, as the slot of the value part gets it. */
  readonly modelValue: ComputedRef<unknown>;
  /** The label of each selected value, in value order; none while nothing is selected. */
  readonly selectedLabels: ComputedRef<readonly string[]>;
  /** The trigger text: the selected labels joined with `, `. */
  readonly valueText: ComputedRef<string>;
  /** Hands an event of a part to the machine and applies the changes it accepts. */
  readonly send: (event: SelectEvent) => void;
  /** Tells the Root which `aria-*` the trigger was given. */
  readonly setTriggerAria: (aria: SelectTriggerAria) => void;
  /** The events of the trigger. */
  readonly trigger: SelectTriggerHandlers;
  /**
   * Holds back the close a focus move would cause while an outside press is decided: the press itself closes the
   * list (or the refusal keeps it open).
   */
  readonly holdFocusOut: (hold: boolean) => void;
  /**
   * Whether a changed value of an item matters to the Root, which must then read the item again: the two values
   * differ (`by`, else `Object.is`) and one of them is selected. An inline object that is new on every render is
   * never selected, so it starts no further render. The item always keeps its latest value.
   */
  readonly valueChangeMatters: (previous: T, next: T) => boolean;
  /** Registers (or updates) an item; returns the function that removes it. */
  readonly registerItem: (item: SelectItemRegistration<T>) => () => void;
}

/** Injection key of the select context. Not exported from any entry point. */
export const SELECT_KEY: InjectionKey<SelectContextValue> = Symbol('cck-select');

/** The group around an item. Not exported from any entry point. */
export interface SelectGroupContext {
  /** The registration key of the group (for the label id). */
  readonly key: string;
  /** Whether the group is disabled. */
  readonly disabled: ComputedRef<boolean>;
}

/** Injection key of the group context. Not exported from any entry point. */
export const SELECT_GROUP_KEY: InjectionKey<SelectGroupContext> = Symbol('cck-select-group');

/** What an item gives its text part. Not exported from any entry point. */
export interface SelectItemContext {
  /** Tells the item which element holds its text; `null` on unmount. */
  readonly setTextElement: (element: HTMLElement | null) => void;
  /** Whether the item is selected: its indicator then holds its icon. */
  readonly selected: ComputedRef<boolean>;
}

/** Injection key of the item context. Not exported from any entry point. */
export const SELECT_ITEM_KEY: InjectionKey<SelectItemContext> = Symbol('cck-select-item');

/**
 * The context of the nearest SelectRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a SelectRoot.
 */
export function useSelectContext<T>(part: string): SelectContextValue<T> {
  const context = inject(SELECT_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <SelectRoot>.`);
  return context;
}

/**
 * Provides the context of a SelectRoot. The context of a Select of `T` is read by the parts as one of `unknown`,
 * so it is passed as `unknown` here and the one cast sits in this file.
 *
 * @param context - The context, built by the SelectRoot.
 */
export function provideSelect(context: unknown): void {
  provide(SELECT_KEY, context as SelectContextValue);
}
