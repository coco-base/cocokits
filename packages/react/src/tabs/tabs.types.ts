import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { ChangeDetails, Direction } from '@cocokits/shared';
import type { TabsActivationMode, TabsChangeReason, TabsOrientation } from '@cocokits/machines/tabs';

export type { TabsActivationMode, TabsChangeReason, TabsOrientation };

/** What `onValueChange` receives besides the selected value: the reason and the event behind it. */
export type TabsChangeDetails = ChangeDetails<TabsChangeReason>;

/** The public state of the Root, the List, passed to the function form of `render`. */
export interface TabsState {
  /** The orientation of the tabs. */
  readonly orientation: TabsOrientation;
}

/** The public state of one Trigger, passed to the function form of `render`. */
export interface TabsTriggerState extends TabsState {
  /** Whether this tab is selected. */
  readonly selected: boolean;
  /** Whether this tab is disabled. */
  readonly disabled: boolean;
}

/** The public state of one Content, passed to the function form of `render`. */
export interface TabsContentState extends TabsState {
  /** Whether this panel is shown. */
  readonly selected: boolean;
}

/**
 * The props the function form of `render` receives: the native props merged with the part's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface TabsRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-selected` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * The `render` prop of a part: an element, or a function of the merged props and the part's state. The function
 * form does not work from a Server Component.
 */
type RenderProp<S> = ReactElement | ((props: TabsRenderProps, state: S) => ReactElement);

/** Props of the {@link TabsRoot}. Native `div` props pass through. */
export interface TabsRootProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue' | 'dir'> {
  /**
   * The tabs: a `Tabs.List` and one `Tabs.Content` per trigger.
   *
   * @cckSemantic tabs.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The value of the selected tab, which makes the tabs controlled. A parent that does not update it after
   * `onValueChange` keeps the old selection. Without a value or `defaultValue` the server output selects no
   * tab and the first enabled tab is selected after mount; pass `defaultValue` for a selected tab in the server output.
   *
   * @cckSemantic tabs.value
   */
  readonly value?: string | undefined;
  /**
   * The initial value of an uncontrolled Tabs, read once. Pass it for a selected tab in the server output.
   *
   * @cckSemantic none
   * @cckParity React's uncontrolled mode; Angular and Vue bind `value` as a model.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after every selection the user makes (a click, or a key), with the new value and the reason. Never
   * when the parent sets `value`.
   *
   * @cckSemantic tabs.valueChange
   * @cckParity React's change callback; Angular emits `selectedTabChange` and Vue emits `update:modelValue`.
   */
  readonly onValueChange?: ((value: string, details: TabsChangeDetails) => void) | undefined;
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
   * The text direction of the tabs and everything inside them, like a `DirectionProvider`: the arrow keys, the
   * `start` and `end` placement and the portal host follow it. Without it the nearest `DirectionProvider`
   * applies, then `'ltr'`. Only a `dir` you pass is rendered on the element.
   *
   * @cckSemantic none
   * @cckParity Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the {@link TabsState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabsState> | undefined;
}

/** Props of the {@link TabsList}. Native `div` props pass through; name the list with `aria-label`. */
export interface TabsListProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The triggers, and the `Tabs.Indicator` as a direct child. The list renders no indicator itself.
   *
   * @cckSemantic tabs.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The accessible name of the list.
   *
   * @cckSemantic tabs.list.aria-label
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the list.
   *
   * @cckSemantic tabs.list.aria-labelledby
   */
  readonly 'aria-labelledby'?: string | undefined;
  /**
   * Whether the arrow keys wrap from the last tab to the first and back; `false` stops at the ends. Home and End
   * are not affected.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity React and Vue only; Angular always wraps and has no input.
   */
  readonly loop?: boolean | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the {@link TabsState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular renders the list and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabsState> | undefined;
}

/** Props of the {@link TabsTrigger}. Native button props pass through. */
export interface TabsTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'value'> {
  /**
   * The trigger label, rendered inside the label span as written.
   *
   * @cckSemantic tabs.label
   * @cckParity Angular takes the label as `label` or as a `cckTabLabel` template on the `cckTab` section.
   */
  readonly children?: ReactNode | undefined;
  /**
   * The tab this trigger selects: the `value` of its `Tabs.Content`. Unique inside the Tabs.
   *
   * @cckSemantic tabs.trigger.value
   * @cckParity Angular selects by index, so `cckTab` has no `value`.
   */
  readonly value: string;
  /**
   * Whether the trigger is disabled: it is never selected by the user and the arrow keys skip it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set `false` when `render` gives another element: it
   * then gets Enter and Space selection on keydown, and `aria-disabled="true"` instead of `disabled` and no `type`. In development a tag that does not match logs a `CocoKits:` error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity React's element kind for `render` (Base UI); Vue decides it with `as`.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the rendered `<button>`: an element, or a function of the merged props and the
   * {@link TabsTriggerState}. The function form must spread all the props it receives, including `ref`, onto
   * one element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular renders the trigger and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabsTriggerState> | undefined;
}

/** Props of the {@link TabsContent}. Native `div` props pass through. */
export interface TabsContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the panel. It is rendered only while the tab is selected, or always with `forceMount`.
   *
   * @cckSemantic tabs.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The tab this panel belongs to: the `value` of its `Tabs.Trigger`. Unique inside the Tabs.
   *
   * @cckSemantic tabs.panel.value
   * @cckParity Angular selects by index, so `cckTab` has no `value`.
   */
  readonly value: string;
  /**
   * Keeps the children rendered while the tab is not selected. The panel stays `hidden`, so the page shows the
   * same as without it; the children keep their state.
   *
   * @cckSemantic tabs.panel.forceMount
   * @cckParity Angular keeps content of every panel with `preserveContent` on the root.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link TabsContentState}. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabsContentState> | undefined;
}

/** Props of the {@link TabsIndicator}. Native `span` props pass through. */
export interface TabsIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the rendered `<span>`: an element, or a function of the merged props and the {@link TabsState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular renders the indicator itself and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabsState> | undefined;
}

/** A Tabs part: a function component with its `displayName`. */
export interface TabsPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
