import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { TabsActivationMode, TabsChangeReason, TabsOrientation, TabsValue } from '@cocokits/machines/tabs';

export type { TabsActivationMode, TabsChangeReason, TabsOrientation, TabsValue };

/**
 * The root of the tabs: it renders the `div` around the list and the panels and holds the selected value. Bind
 * it with `v-model`; without a value the first enabled tab is selected. On the server this holds when the triggers
 * render before the panels (`TabsList` first); in any other order pass a value.
 *
 * @example
 * <TabsRoot v-model="tab">
 *   <TabsList aria-label="Account settings">
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *     <TabsIndicator />
 *   </TabsList>
 *   <TabsContent value="account">Change your name.</TabsContent>
 *   <TabsContent value="password">Change your password.</TabsContent>
 * </TabsRoot>
 *
 * @typeParam T - The type of a tab value: a `string` or a `number`. Defaults to `string`.
 * @cckPart root
 */
export interface TabsRootProps<T extends TabsValue = string> {
  /**
   * The value of the selected tab, bound with `v-model`. Bound with a listener it is controlled: a parent that
   * does not accept a change keeps the old value. Unbound, or bound without a listener, the tabs keep their own
   * value. Without a value the first enabled tab is selected. On the server this holds when the triggers
   * render before the panels (`TabsList` first); in any other order pass a value.
   *
   * @cckSemantic tabs.value
   * @cckParity Bound with `v-model`.
   */
  readonly modelValue?: T | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The initial value of Tabs whose `v-model` is not bound, read once when they are created. Binding
   * `modelValue` ignores it. The tab with this value is selected in the server output.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultValue?: T | undefined;
  /**
   * Whether the tabs are laid out in a row or a column; `vertical` moves with Up and Down.
   *
   * @defaultValue 'horizontal'
   */
  readonly orientation?: TabsOrientation | undefined;
  /**
   * `automatic` selects a tab when it receives focus by an arrow key; `manual` waits for Enter or Space.
   *
   * @defaultValue 'automatic'
   */
  readonly activationMode?: TabsActivationMode | undefined;
  /**
   * Whether a panel that is not selected removes its content (`true`) or keeps rendering it, hidden (`false`).
   * `TabsContent` with `forceMount` keeps its own content whatever this says.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly unmountOnHide?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * The text direction of the tabs: the keys (ArrowLeft and ArrowRight), the placement and the nested components
   * follow it, and the root renders the `dir` attribute only when you pass one. Without it the nearest
   * `provideDirection` applies, else `'ltr'`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the root merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of the TabsRoot.
 *
 * @typeParam T - The type of a tab value: a `string` or a `number`. Defaults to `string`.
 */
export interface TabsRootEmits<T extends TabsValue = string> {
  /**
   * Emits with the new value for `v-model`, after every selection the tabs accept.
   *
   * @cckSemantic tabs.valueChange
   * @remarks Carries the new value only, no reason.
   * @cckParity The `update:modelValue` event is the only change event; it carries no reason.
   */
  'update:modelValue': [value: T];
}

/**
 * The `div role="tablist"` that holds the triggers and the `TabsIndicator`, as direct children. Name it with
 * `aria-label` or `aria-labelledby`, which fall through to the element like every native attribute. The arrow keys,
 * Home and End move focus between the enabled triggers (the horizontal arrows flip in right-to-left) and, in
 * `automatic` mode, select the focused tab. A tab that is selected or focused is scrolled into view in the list
 * when it overflows; only the list scrolls.
 *
 * @example
 * <TabsList aria-label="Account settings">
 *   <TabsTrigger value="account">Account</TabsTrigger>
 *   <TabsIndicator />
 * </TabsList>
 *
 * @cckPart list
 */
export interface TabsListProps {
  /**
   * Whether the arrow keys wrap from the last tab to the first and back. With `false` they stop at the ends.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly loop?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the list merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `button role="tab"` that selects the panel with the same `value`. It carries `aria-selected`,
 * `aria-controls` and `data-selected`; only the selected tab is in the tab order, the others are reached with the
 * arrow keys. The default slot is wrapped in a label `span`.
 *
 * @example
 * <TabsTrigger value="account">Account</TabsTrigger>
 *
 * @cckPart trigger
 * @cckPart triggerLabel
 */
export interface TabsTriggerProps {
  /**
   * The tab this trigger selects: the `value` of its `TabsContent`. A string or a number, unique inside the tabs
   * and compared with `===`, so `1` and `'1'` are different tabs.
   *
   * @cckSemantic tabs.trigger.value
   * @cckParity Not available in every framework.
   */
  readonly value: string | number;
  /**
   * Whether the trigger is disabled: it is never selected by the user and the arrow keys skip it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` keeps `role="tab"` and the roving `tabindex`, gets no `type`, selects on
   * Enter and Space, and when disabled gets `aria-disabled="true"` in place of `disabled`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the trigger merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child must render a `button`; its own props win except the ARIA, id and state markers.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `div role="tabpanel"` of one tab. It is named by its trigger (`aria-labelledby`), is reachable with Tab
 * (`tabindex="0"`) and carries the native `hidden` attribute while its tab is not selected. The element is always
 * rendered, so the trigger's `aria-controls` resolves, but its content is rendered only while the tab is selected,
 * or always with `forceMount` or the root's `unmountOnHide` set to `false` (the panel then stays `hidden`).
 *
 * @example
 * <TabsContent value="account">Change your name.</TabsContent>
 *
 * @cckPart panel
 */
export interface TabsContentProps {
  /**
   * The tab this panel belongs to: the `value` of its `TabsTrigger`. Unique inside the tabs.
   *
   * @cckSemantic tabs.panel.value
   */
  readonly value: string | number;
  /**
   * Whether the content is rendered while the tab is not selected. The panel stays `hidden`.
   *
   * @cckSemantic tabs.panel.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the panel merges onto its first element or component child instead of rendering a `div`. The
   * content is that child's own children.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The decorative `span` that marks the selected tab. Place it as a direct child of `TabsList`, after the
 * triggers; without it no indicator is rendered. After mount the base writes `--active-tab-left`,
 * `--active-tab-top`, `--active-tab-width` and `--active-tab-height` on it, the box of the selected trigger inside
 * the list, and keeps them current when the list or any trigger resizes.
 *
 * @example
 * <TabsIndicator />
 *
 * @cckPart indicator
 */
export interface TabsIndicatorProps {
  /**
   * The tag or component to render, in place of the `span`. The part keeps its class and `aria-hidden`. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the indicator merges onto its first element or component child instead of rendering a `span`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
