import { inject, type ComputedRef, type InjectionKey } from 'vue';
import type {
  TabsActivationMode,
  TabsEvent,
  TabsItem,
  TabsOrientation,
  TabsState,
  TabsValue,
} from '@cocokits/machines/tabs';

/** What a TabsTrigger tells the root about itself: getters, so a change after mount is seen on the next read. */
export interface TabsRegistration {
  /** The tab value. */
  readonly value: () => TabsValue;
  /** Whether the trigger is disabled. */
  readonly disabled: () => boolean;
  /** The trigger element, `null` before it is mounted. */
  readonly element: () => HTMLElement | null;
}

/** What a TabsRoot gives its parts. */
export interface TabsContextValue {
  /** The machine state; each part computes its own props from it. */
  readonly state: ComputedRef<TabsState>;
  /** Sends a machine event of a trigger. */
  readonly dispatch: (event: TabsEvent) => void;
  /** The selected value, `undefined` before any trigger has set up and no value was given. */
  readonly selected: ComputedRef<TabsValue | undefined>;
  /** The orientation. */
  readonly orientation: ComputedRef<TabsOrientation>;
  /** The activation mode. */
  readonly activationMode: ComputedRef<TabsActivationMode>;
  /** The registered tabs in document order. */
  readonly items: ComputedRef<readonly TabsItem[]>;
  /** The registered triggers in document order, with their elements. Read on demand, so it is always current. */
  readonly getEntries: () => readonly TabsRegistration[];
  /** Registers a trigger; returns the function that unregisters it. */
  readonly register: (entry: TabsRegistration) => () => void;
  /** Offers a trigger at setup, in tree order: the first enabled one is the server selection. */
  readonly claimInitial: (value: TabsValue, disabled: boolean) => void;
  /** Lists the registered triggers again: call it after a render that may have moved or changed one. */
  readonly refresh: () => void;
  /** The trigger element of a value, `undefined` when none is registered. */
  readonly getTrigger: (value: TabsValue) => HTMLElement | undefined;
  /** Marks the trigger of this value as keyboard-focused when the last input was the keyboard. */
  readonly focusTrigger: (value: TabsValue) => void;
  /** Clears the keyboard-focus mark. */
  readonly blurTrigger: () => void;
}

/** Injection key of the tabs context. Not exported from any entry point. */
export const TABS_KEY: InjectionKey<TabsContextValue> = Symbol('cck-tabs');

/**
 * The context of the nearest TabsRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a TabsRoot.
 */
export function useTabsContext(part: string): TabsContextValue {
  const context = inject(TABS_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <TabsRoot>.`);
  return context;
}
