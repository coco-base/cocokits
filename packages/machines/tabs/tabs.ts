import { resolveTabStop } from '@cocokits/cdk/roving-focus';
import { dataAttr, toIdSegment } from '@cocokits/utils';
import { tabsAnatomy } from './tabs.anatomy';
import type {
  TabsEvent,
  TabsIds,
  TabsItem,
  TabsKeyBinding,
  TabsListProps,
  TabsOrientation,
  TabsPanelProps,
  TabsParts,
  TabsState,
  TabsTransition,
  TabsTriggerProps,
  TabsValue,
} from './tabs.types';

/**
 * The handled keys, as data. The meta keyboard table has one row per `row`; Tab, Enter and Space are native.
 * The adapters run the keys through `createRovingFocus`; the machine only decides what the move does.
 */
export const tabsKeymap: readonly TabsKeyBinding[] = [
  { keys: ['ArrowRight', 'ArrowLeft'], orientation: 'horizontal', row: 'ArrowRight / ArrowLeft' },
  { keys: ['ArrowDown', 'ArrowUp'], orientation: 'vertical', row: 'ArrowDown / ArrowUp' },
  { keys: ['Home', 'End'], row: 'Home / End' },
];

/**
 * Derives the ids of the trigger and the panel of one tab. The key is the item's `key` or, without one, the
 * injective `toIdSegment` of its value, so two values never share an id (`1` and `'1'` differ too). The
 * item's `id` replaces the trigger id.
 *
 * @param id - The id of the tabs, from the adapter.
 * @param item - The tab; only `value`, `key` and `id` are read.
 * @returns The trigger id and the panel id.
 */
export function tabsIds(id: string, item: Pick<TabsItem, 'value' | 'key' | 'id'>): TabsIds {
  const key = item.key ?? toIdSegment(item.value);
  return { trigger: item.id ?? `${id}-trigger-${key}`, panel: `${id}-panel-${key}` };
}

/**
 * Resolves which tab is selected: the given value, even before its tab is registered (the server
 * renders the default value selected), else the first enabled tab. Computed from props and
 * registration only.
 *
 * @param items - The tabs in document order.
 * @param value - The selected value, or `undefined` when none was chosen yet.
 * @returns The selected value, or `undefined` when there is no value and no enabled tab.
 */
export function resolveSelectedTab(items: readonly TabsItem[], value: TabsValue | undefined): TabsValue | undefined {
  return value ?? items.find((item) => !item.disabled)?.value;
}

function tabStop(state: TabsState): TabsValue | undefined {
  const selected = resolveSelectedTab(state.items, state.value);
  const index = resolveTabStop(
    state.items.map((item) => ({ disabled: item.disabled === true })),
    state.items.findIndex((item) => item.value === selected),
  );
  return state.items[index]?.value ?? selected;
}

/**
 * Computes what the adapter does after an event. Pure.
 *
 * - A click selects an enabled tab that is not selected.
 * - A key move focuses the target, and in automatic mode also selects it.
 *
 * @param state - The tabs state.
 * @param event - The event a trigger handler sent.
 * @returns The value to focus and the value to report; empty when nothing changes.
 */
export function transitionTabs(state: TabsState, event: TabsEvent): TabsTransition {
  const selected = resolveSelectedTab(state.items, state.value);
  const target = state.items.find((item) => item.value === event.value);
  const selectable = target?.disabled !== true && event.value !== selected;
  if (event.type === 'TRIGGER.CLICK') return selectable ? { select: event.value } : {};
  return selectable && (state.activationMode ?? 'automatic') === 'automatic'
    ? { focus: event.value, select: event.value }
    : { focus: event.value };
}

function listProps(orientation: TabsOrientation): TabsListProps {
  return {
    class: tabsAnatomy.classes.list,
    role: 'tablist',
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
    'data-orientation': orientation,
  };
}

/**
 * Computes the props of every Tabs part. Pure: no DOM, same result on the server and the client. The
 * handlers send events; they compute nothing while the props are computed.
 *
 * @param state - The author's props and the tracked facts.
 * @param send - Receives the click events of the trigger; pass them to {@link transitionTabs}. Key moves come
 *   from the adapter's roving focus, which sends `TRIGGER.NAVIGATE` itself.
 * @returns The props of the fixed parts and a function per tab for the trigger and the panel.
 */
export function getTabsProps(state: TabsState, send: (event: TabsEvent) => void): TabsParts {
  const { classes } = tabsAnatomy;
  const orientation = state.orientation ?? 'horizontal';
  const selected = resolveSelectedTab(state.items, state.value);
  const stop = tabStop(state);
  return {
    root: { class: classes.root, 'data-orientation': orientation },
    list: listProps(orientation),
    indicator: { class: classes.indicator, 'aria-hidden': 'true' },
    triggerLabel: { class: classes.triggerLabel },
    trigger(item): TabsTriggerProps {
      const ids = tabsIds(state.id, item);
      const isSelected = item.value === selected;
      return {
        class: classes.trigger,
        id: ids.trigger,
        role: 'tab',
        type: 'button',
        'aria-selected': isSelected ? 'true' : 'false',
        'aria-controls': ids.panel,
        tabIndex: item.value === stop ? 0 : -1,
        disabled: item.disabled ? true : undefined,
        'data-orientation': orientation,
        'data-selected': dataAttr(isSelected),
        'data-disabled': dataAttr(item.disabled),
        'data-focus-visible': dataAttr(state.focusVisibleValue === item.value),
        onClick: (event) => {
          if (event.defaultPrevented) return;
          send({ type: 'TRIGGER.CLICK', value: item.value, event });
        },
      };
    },
    panel(item): TabsPanelProps {
      const ids = tabsIds(state.id, item);
      const isSelected = item.value === selected;
      return {
        class: classes.panel,
        id: ids.panel,
        role: 'tabpanel',
        'aria-labelledby': ids.trigger,
        tabIndex: 0,
        hidden: isSelected ? undefined : true,
        'data-orientation': orientation,
        'data-selected': dataAttr(isSelected),
      };
    },
    hasContent: (item, keep) => item.value === selected || (keep ?? state.keepContent === true),
  };
}
