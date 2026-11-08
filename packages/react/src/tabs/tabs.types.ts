import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { ChangeDetails, Direction } from '@cocokits/shared';
import type { TabsActivationMode, TabsChangeReason, TabsOrientation } from '@cocokits/machines/tabs';
import type { RenderProp } from '../internal/render-element';

export type { TabsActivationMode, TabsChangeReason, TabsOrientation };

/** What `onValueChange` receives besides the selected value: the `reason` and the `event` behind the change. */
export type TabsChangeDetails = ChangeDetails<TabsChangeReason>;

/** The state of the Root, the List and the Indicator that the function form of `render` receives. */
export interface TabsState {
  /** The direction in which the tabs are laid out. */
  readonly orientation: TabsOrientation;
}

/** The state of one Trigger that the function form of `render` receives. */
export interface TabsTriggerState extends TabsState {
  /** Whether this tab is selected. */
  readonly selected: boolean;
  /** Whether this tab is disabled. */
  readonly disabled: boolean;
}

/** The state of one Content that the function form of `render` receives. */
export interface TabsContentState extends TabsState {
  /** Whether this panel shows. */
  readonly selected: boolean;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface TabsRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-selected` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link TabsRoot}. Native `div` props pass through. */
export interface TabsRootProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue' | 'dir'> {
  /**
   * The tabs: a `Tabs.List` and one `Tabs.Content` for each trigger. When not set, the tabs are empty.
   *
   * @example
   * <Tabs.Root defaultValue="account">
   *   <Tabs.List aria-label="Account settings">...</Tabs.List>
   *   <Tabs.Content value="account">Change your name.</Tabs.Content>
   * </Tabs.Root>
   * @cckSemantic tabs.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The value of the selected tab. Setting it makes the tabs controlled. If you do not update it after
   * `onValueChange`, the old tab stays selected.
   *
   * When not set, the tabs keep their own value, which starts as `defaultValue`. Without both, the server render
   * selects no tab, and the first enabled tab is selected after mount.
   *
   * @cckSemantic tabs.value
   */
  readonly value?: string | undefined;
  /**
   * The start value of tabs that you do not control with `value`. Pass it to render a selected tab on the server.
   * When not set, the first enabled tab is selected after mount.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after the user selects a tab with a click or a key. It receives the new value and a details object with
   * the `reason` and the `event`.
   *
   * It is never called when you change `value` yourself.
   *
   * @example
   * const [tab, setTab] = useState('account');
   * <Tabs.Root value={tab} onValueChange={(value) => setTab(value)}>
   *   ...
   * </Tabs.Root>
   * @cckSemantic tabs.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string, details: TabsChangeDetails) => void) | undefined;
  /**
   * The direction in which the tabs are laid out. It also sets the arrow keys that move between the tabs.
   *
   * @defaultValue 'horizontal'
   */
  readonly orientation?: TabsOrientation | undefined;
  /**
   * When an arrow key selects the tab that it moves the focus to.
   *
   * @defaultValue 'automatic'
   */
  readonly activationMode?: TabsActivationMode | undefined;
  /**
   * The text direction of the tabs and everything inside them. The arrow keys, the `start` and `end` placement and
   * the overlay container follow it. When not set, the nearest `DirectionProvider` applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * The function form does not work from a Server Component.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabsRenderProps, TabsState> | undefined;
}

/** Props of the {@link TabsList}. Native `div` props pass through. Name the list with `aria-label`. */
export interface TabsListProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The triggers, and the `Tabs.Indicator` as a direct child. The list renders no indicator of its own. When not
   * set, the list is empty.
   *
   * @example
   * <Tabs.List aria-label="Account settings">
   *   <Tabs.Trigger value="account">Account</Tabs.Trigger>
   *   <Tabs.Trigger value="password">Password</Tabs.Trigger>
   *   <Tabs.Indicator />
   * </Tabs.List>
   * @cckSemantic tabs.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The accessible name of the list. When not set, name the list with `aria-labelledby`.
   *
   * @cckSemantic tabs.list.aria-label
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the list. When not set, name the list with `aria-label`.
   *
   * @cckSemantic tabs.list.aria-labelledby
   */
  readonly 'aria-labelledby'?: string | undefined;
  /**
   * Whether the arrow keys move from the last tab to the first, and from the first to the last. With `false`, they
   * stop at the ends. Home and End do not change.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly loop?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * The function form does not work from a Server Component.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabsRenderProps, TabsState> | undefined;
}

/** Props of the {@link TabsTrigger}. Native button props pass through. */
export interface TabsTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'value'> {
  /**
   * The label of the tab, which is also its accessible name. When not set, the tab has no name, so you must give
   * it an `aria-label`.
   *
   * @example
   * <Tabs.Trigger value="account">Account</Tabs.Trigger>
   * @cckSemantic tabs.label
   * @cckParity The label is the content of the trigger part.
   */
  readonly children?: ReactNode | undefined;
  /**
   * The tab that this trigger selects: the `value` of its `Tabs.Content`. It must be unique inside the Tabs.
   *
   * @cckSemantic tabs.trigger.value
   * @cckParity Not available in every framework.
   */
  readonly value: string;
  /**
   * Whether the tab is disabled. The user cannot select it, and the arrow keys skip it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element.
   *
   * That element then gets selection by Enter and Space, `aria-disabled="true"` in place of `disabled`, and no
   * `type`. In development, a tag that does not match logs an error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. An element that is not a `<button>` also needs
   * `nativeButton={false}`.
   *
   * The function form does not work from a Server Component.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabsRenderProps, TabsTriggerState> | undefined;
}

/** Props of the {@link TabsContent}. Native `div` props pass through. */
export interface TabsContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the panel. It renders only while its tab is selected, or always with `forceMount`. When not
   * set, the panel is empty.
   *
   * @example
   * <Tabs.Content value="account">Change your name.</Tabs.Content>
   * @cckSemantic tabs.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The tab that this panel belongs to: the `value` of its `Tabs.Trigger`. It must be unique inside the Tabs.
   *
   * @cckSemantic tabs.panel.value
   * @cckParity Not available in every framework.
   */
  readonly value: string;
  /**
   * Whether the children stay rendered while the tab is not selected. The panel stays `hidden`, so the page looks
   * the same, and the children keep their state.
   *
   * When not set, the children render only while the tab is selected.
   *
   * @cckSemantic tabs.panel.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * The function form does not work from a Server Component.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabsRenderProps, TabsContentState> | undefined;
}

/** Props of the {@link TabsIndicator}. Native `span` props pass through. */
export interface TabsIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * The function form does not work from a Server Component.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabsRenderProps, TabsState> | undefined;
}

/** A Tabs part: a function component with its `displayName`. */
export interface TabsPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
