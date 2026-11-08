import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { TabsActivationMode, TabsChangeReason, TabsOrientation, TabsValue } from '@cocokits/machines/tabs';

export type { TabsActivationMode, TabsChangeReason, TabsOrientation, TabsValue };

/**
 * Holds the selected value of the tabs. It renders a `<div>` around the list and the panels. Bind the value with
 * `v-model`.
 *
 * Without a value, the first enabled tab is selected. On the server, that is so only when the triggers render
 * before the panels, with `TabsList` first. In any other order, pass a value.
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
   * The value of the selected tab, bound with `v-model`. When not set, the tabs keep their own value, which starts
   * as `defaultValue`, or else the first enabled tab.
   *
   * Bound without a listener, the tabs also keep their own value. If you listen for changes and do not accept one,
   * the old value stays. On the server, the first enabled tab is found only when `TabsList` renders before the
   * panels. In any other order, pass a value.
   *
   * @cckSemantic tabs.value
   * @cckParity Bound with `v-model`.
   */
  readonly modelValue?: T | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`. The framework fills it. The component declares it so the
   * modifiers do not reach the DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start value of tabs whose `v-model` is not bound. It is read once, when the tabs are created. The tab with
   * this value is selected in the server output.
   *
   * When not set, the first enabled tab starts selected. A bound `modelValue` ignores it.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultValue?: T | undefined;
  /**
   * Whether the tabs sit in a row or in a column. It decides which arrow keys move the focus.
   *
   * @defaultValue 'horizontal'
   */
  readonly orientation?: TabsOrientation | undefined;
  /**
   * When a tab that gets the focus from an arrow key is selected.
   *
   * @defaultValue 'automatic'
   */
  readonly activationMode?: TabsActivationMode | undefined;
  /**
   * Whether a panel that is not selected removes its content. With `false`, the panel keeps it rendered and hidden.
   * A `TabsContent` with `forceMount` always keeps its content.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly unmountOnHide?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * The text direction of the tabs. ArrowLeft and ArrowRight, the placement and the nested components follow it.
   * When not set, the nearest direction provider applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the root element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
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
   * Emits the new value for `v-model` after every selection the tabs accept. It carries the new value only, and no
   * reason.
   *
   * @example
   * <TabsRoot :model-value="tab" @update:model-value="(value) => (tab = value)">...</TabsRoot>
   *
   * @cckSemantic tabs.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries no reason.
   */
  'update:modelValue': [value: T];
}

/**
 * The `<div role="tablist">` that holds the triggers and the `TabsIndicator`, as direct children. Name it with
 * `aria-label` or `aria-labelledby`, which fall through to the element as every native attribute does.
 *
 * The arrow keys, Home and End move the focus between the enabled triggers. The horizontal arrows swap in
 * right-to-left. In `automatic` mode, they also select the focused tab.
 *
 * A tab that is selected or focused scrolls into view in the list when the list overflows. Only the list scrolls.
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
   * Whether the arrow keys go from the last tab to the first and back. With `false`, they stop at the ends.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly loop?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `<button role="tab">` that selects the panel with the same `value`. It carries `aria-selected`,
 * `aria-controls` and `data-selected`. The default slot is wrapped in a label `<span>`.
 *
 * Only the selected tab is in the Tab order. The arrow keys reach the others.
 *
 * With `as`, a tag or component other than `button` keeps `role="tab"` and the moving `tabindex`, and gets no
 * `type`. It selects on Enter and Space. When disabled, it gets `aria-disabled="true"` in place of `disabled`. With
 * `asChild`, the child must render a `<button>`. Its own props win, except the ARIA, the id and the state markers.
 *
 * @example
 * <TabsTrigger value="account">Account</TabsTrigger>
 *
 * @cckPart trigger
 * @cckPart triggerLabel
 */
export interface TabsTriggerProps {
  /**
   * The tab this trigger selects: the `value` of its `TabsContent`. It must be unique inside the tabs.
   *
   * Values are compared with `===`, so `1` and `'1'` are different tabs.
   *
   * @cckSemantic tabs.trigger.value
   * @cckParity Not available in every framework.
   */
  readonly value: string | number;
  /**
   * Whether the trigger is disabled. The user can never select it, and the arrow keys skip it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `<div role="tabpanel">` of one tab. Its trigger names it with `aria-labelledby`. It has `tabindex="0"`, so Tab
 * reaches it, and it carries the native `hidden` attribute while its tab is not selected.
 *
 * The element is always rendered, so the `aria-controls` of the trigger points at it. Its content is rendered only
 * while the tab is selected. With `forceMount`, or with `unmountOnHide` of the root set to `false`, the content is
 * always rendered, and the panel stays `hidden`.
 *
 * @example
 * <TabsContent value="account">Change your name.</TabsContent>
 *
 * @cckPart panel
 */
export interface TabsContentProps {
  /**
   * The tab this panel belongs to: the `value` of its `TabsTrigger`. It must be unique inside the tabs.
   *
   * @cckSemantic tabs.panel.value
   */
  readonly value: string | number;
  /**
   * Whether the content is rendered while the tab is not selected. The panel stays `hidden`. When not set, the
   * `unmountOnHide` of the root decides.
   *
   * @cckSemantic tabs.panel.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `<span>` that marks the selected tab, for decoration. Place it as a direct child of `TabsList`, after the
 * triggers. Without it, no indicator is rendered.
 *
 * After mount, it gets `--active-tab-left`, `--active-tab-top`, `--active-tab-width` and `--active-tab-height`: the
 * box of the selected trigger inside the list. They stay current when the list or a trigger changes size.
 *
 * With `as`, the part keeps its class and `aria-hidden`.
 *
 * @example
 * <TabsIndicator />
 *
 * @cckPart indicator
 */
export interface TabsIndicatorProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
