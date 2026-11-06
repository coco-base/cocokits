import type { Direction } from '@cocokits/shared';

/** How the tabs are laid out; it decides the arrow keys. */
export type TabsOrientation = 'horizontal' | 'vertical';

/** `automatic` selects a tab when it receives focus by arrow key; `manual` waits for Enter or Space. */
export type TabsActivationMode = 'automatic' | 'manual';

/** Why the selected tab changed. Only the user changes it. */
export type TabsChangeReason = 'user';

/** What identifies a tab: a string or a number. Compared with `===`, so `1` and `'1'` are different tabs. */
export type TabsValue = string | number;

/** One registered tab, read in document order by the adapter. */
export interface TabsItem {
  /** The value that links the trigger to its panel. */
  readonly value: TabsValue;
  /**
   * The key that enters the trigger and panel ids. Leave it out to derive it from `value` with the injective
   * `toIdSegment`; an adapter whose ids must never depend on the value gives each tab its generated id here.
   */
  readonly key?: string | undefined;
  /** The trigger id, replacing the generated `<id>-trigger-<key>`; the panel's `aria-labelledby` follows it. */
  readonly id?: string | undefined;
  /** A disabled tab is never selected by the user and arrow keys skip it. @defaultValue false */
  readonly disabled?: boolean | undefined;
}

/** Inputs of `getTabsProps` and `transitionTabs`. */
export interface TabsState {
  /** The SSR-stable id of the tabs, from the adapter. */
  readonly id: string;
  /** The tabs in document order. */
  readonly items: readonly TabsItem[];
  /** The selected value (controlled or tracked); `undefined` selects the first enabled tab. */
  readonly value?: TabsValue | undefined;
  /** Every panel renders its content, not only the selected one. @defaultValue false */
  readonly keepContent?: boolean | undefined;
  /** @defaultValue 'horizontal' */
  readonly orientation?: TabsOrientation | undefined;
  /** @defaultValue 'automatic' */
  readonly activationMode?: TabsActivationMode | undefined;
  /** The text direction from the direction runtime; it flips the horizontal arrows only. @defaultValue 'ltr' */
  readonly dir?: Direction | undefined;
  /** The value of the trigger that has keyboard focus visible; the adapter tracks it after mount. */
  readonly focusVisibleValue?: TabsValue | undefined;
}

/** The events the trigger handlers send. */
export type TabsEvent =
  | {
      /** A click (or native Enter and Space activation) on a trigger. */
      readonly type: 'TRIGGER.CLICK';
      readonly value: TabsValue;
      readonly event: Event;
    }
  | {
      /** The roving focus moved to another enabled trigger (an arrow, Home or End key). */
      readonly type: 'TRIGGER.NAVIGATE';
      readonly value: TabsValue;
      readonly event: Event;
    };

/** What the adapter does after an event. A missing key means nothing to do. */
export interface TabsTransition {
  /** Focus the trigger of this value. */
  readonly focus?: TabsValue;
  /** Report this value as the new selection (reason `'user'`). */
  readonly select?: TabsValue;
}

/** The ids of the trigger and the panel of one value. */
export interface TabsIds {
  /** The item's `id`, else `<id>-trigger-<key>`. */
  readonly trigger: string;
  /** `<id>-panel-<key>`. */
  readonly panel: string;
}

/** Props shared by every part. */
export interface TabsPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the root part. */
export interface TabsRootProps extends TabsPartProps {
  /** The orientation. */
  readonly 'data-orientation': TabsOrientation;
}

/** Props of the list part. */
export interface TabsListProps extends TabsPartProps {
  /** Always `'tablist'`. */
  readonly role: 'tablist';
  /** `'vertical'` only when vertical. */
  readonly 'aria-orientation'?: 'vertical' | undefined;
  /** The orientation. */
  readonly 'data-orientation': TabsOrientation;
}

/** Props of the trigger label and the indicator. */
export interface TabsDecorativeProps extends TabsPartProps {
  /** Present (`'true'`) on the indicator only. */
  readonly 'aria-hidden'?: 'true' | undefined;
}

/** Props of one trigger. */
export interface TabsTriggerProps extends TabsPartProps {
  /** The trigger id: see {@link TabsIds.trigger}. */
  readonly id: string;
  /** Always `'tab'`. */
  readonly role: 'tab';
  /** Always `'button'`, so a trigger never submits a form. */
  readonly type: 'button';
  /** `'true'` on the selected tab, `'false'` elsewhere. */
  readonly 'aria-selected': 'true' | 'false';
  /** The id of the panel of this value. */
  readonly 'aria-controls': string;
  /** `0` on the single tab stop, `-1` elsewhere. */
  readonly tabIndex: 0 | -1;
  /** Native `disabled`, present only when disabled. */
  readonly disabled?: true | undefined;
  /** The orientation. */
  readonly 'data-orientation': TabsOrientation;
  /** Present on the selected tab. */
  readonly 'data-selected'?: '' | undefined;
  /** Present on a disabled tab. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present while the trigger has keyboard focus. */
  readonly 'data-focus-visible'?: '' | undefined;
  /** Sends `TRIGGER.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
}

/** Props of one panel. */
export interface TabsPanelProps extends TabsPartProps {
  /** The panel id: see {@link TabsIds.panel}. */
  readonly id: string;
  /** Always `'tabpanel'`. */
  readonly role: 'tabpanel';
  /** The id of the trigger of this value. */
  readonly 'aria-labelledby': string;
  /** Always `0`: the panel is reachable by Tab. */
  readonly tabIndex: 0;
  /** Native `hidden`, present while the panel is not selected. */
  readonly hidden?: true | undefined;
  /** The orientation. */
  readonly 'data-orientation': TabsOrientation;
  /** Present on the panel of the selected tab. */
  readonly 'data-selected'?: '' | undefined;
}

/** What `getTabsProps` returns. */
export interface TabsParts {
  /** The root props. */
  readonly root: TabsRootProps;
  /** The tablist props. */
  readonly list: TabsListProps;
  /** The indicator props. */
  readonly indicator: TabsDecorativeProps;
  /** The trigger label props. */
  readonly triggerLabel: TabsDecorativeProps;
  /** The props of the trigger of one tab. */
  readonly trigger: (item: TabsItem) => TabsTriggerProps;
  /** The props of the panel of one tab. */
  readonly panel: (item: TabsItem) => TabsPanelProps;
  /**
   * Whether the panel of one tab renders its content: it is selected, or kept (`keep`, else the state's
   * `keepContent`). The panel element renders either way.
   */
  readonly hasContent: (item: TabsItem, keep?: boolean) => boolean;
}

/** One handled key of the keymap. */
export interface TabsKeyBinding {
  /** The keys. */
  readonly keys: readonly string[];
  /** The orientation the keys apply to; every orientation when left out. */
  readonly orientation?: TabsOrientation;
  /** The `key` text of the matching row of the meta keyboard table. */
  readonly row: string;
}
