import { inject, type ComputedRef, type InjectionKey, type ShallowRef } from 'vue';

/** What a TabNavLink tells the root about itself: getters, so a change after mount is seen on the next read. */
export interface TabNavRegistration {
  /** A key of the link, stable for the life of the link. */
  readonly key: symbol;
  /** Whether the link is the current page. */
  readonly active: () => boolean;
  /** Whether the link is disabled. */
  readonly disabled: () => boolean;
  /** The link element, `null` before it is mounted. */
  readonly element: () => HTMLElement | null;
}

/** The facts of one link that the root keeps as state. */
export interface TabNavListedLink {
  /** The key of the link. */
  readonly key: symbol;
  /** Whether the link is the current page. */
  readonly active: boolean;
  /** Whether the link is disabled. */
  readonly disabled: boolean;
}

/** What a TabNavRoot gives its parts. */
export interface TabNavContextValue {
  /** The id of the linked panel; `undefined` in link mode. */
  readonly panelId: ComputedRef<string | undefined>;
  /** Registers a link; returns the function that unregisters it. */
  readonly register: (entry: TabNavRegistration) => () => void;
  /** Lists the links again: a link calls it after a render that may have changed its `active` or `disabled`. */
  readonly refresh: () => void;
  /** The registered links with their elements, in document order. */
  readonly getEntries: () => readonly TabNavRegistration[];
  /** The links as the root last listed them, `null` until the first mount; a new list means a change. */
  readonly links: Readonly<ShallowRef<readonly TabNavListedLink[] | null>>;
  /**
   * The key of the link that holds the Tab stop after mount, `null` when every link is disabled, `undefined`
   * before the first mount (links then use {@link TabNavContextValue.claim}).
   */
  readonly stop: ComputedRef<symbol | null | undefined>;
  /**
   * The Tab stop during the first render, in setup order: an active link, else the first enabled link to ask
   * (unless the root already saw an active link among its children).
   */
  readonly claim: (key: symbol, active: boolean, disabled: boolean) => boolean;
}

/** Injection key of the TabNav context. Not exported from any entry point. */
export const TAB_NAV_KEY: InjectionKey<TabNavContextValue> = Symbol('cck-tab-nav');

/**
 * The context of the nearest TabNavRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a TabNavRoot.
 */
export function useTabNavContext(part: string): TabNavContextValue {
  const context = inject(TAB_NAV_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <TabNavRoot>.`);
  return context;
}
