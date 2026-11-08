import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface TabNavRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-active` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** The state of the Root, the List, the Indicator and the Panel that the function form of `render` receives. */
export interface TabNavState {
  /** Whether the nav drives a panel through `tabPanel`, so that its links are tabs. */
  readonly panelMode: boolean;
}

/** The state of one Link that the function form of `render` receives. */
export interface TabNavLinkState {
  /** Whether this link is the current page. */
  readonly active: boolean;
  /** Whether this link is disabled. */
  readonly disabled: boolean;
}

/** Props of the {@link TabNavRoot}. Native `nav` props pass through. Name the landmark with `aria-label`. */
export interface TabNavRootProps extends Omit<ComponentPropsWithRef<'nav'>, 'color'> {
  /**
   * The parts: a `TabNav.List` with the `TabNav.Link` elements and a `TabNav.Indicator` in it. When not set, the
   * nav is empty.
   *
   * @example
   * <TabNav.Root aria-label="Project">
   *   <TabNav.List>...</TabNav.List>
   * </TabNav.Root>
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The accessible name of the navigation landmark. A page with more than one navigation needs it. When not set,
   * name the landmark with `aria-labelledby`.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the element.
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The `id` of the `TabNav.Panel` that the links drive. The list then is a `tablist`, and the links are tabs with
   * one Tab stop and the arrow keys.
   *
   * When not set, the links stay plain links.
   *
   * @cckSemantic tab-nav.tabPanel
   * @cckParity Not available in every framework.
   */
  readonly tabPanel?: string | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabNavRenderProps, TabNavState> | undefined;
}

/** Props of the {@link TabNavList}. Native `div` props pass through. */
export interface TabNavListProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The `TabNav.Link` elements, and the `TabNav.Indicator` as a direct child. When not set, the list is empty.
   *
   * @example
   * <TabNav.List>
   *   <TabNav.Link href="/overview" active>Overview</TabNav.Link>
   *   <TabNav.Link href="/activity">Activity</TabNav.Link>
   *   <TabNav.Indicator />
   * </TabNav.List>
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabNavRenderProps, TabNavState> | undefined;
}

/** Props of the {@link TabNavIndicator}. Native `span` props pass through. */
export interface TabNavIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabNavRenderProps, TabNavState> | undefined;
}

/** Props of the {@link TabNavPanel}. Native `div` props pass through. */
export interface TabNavPanelProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the panel, most often the outlet of the router. When not set, the panel is empty.
   *
   * @example
   * <TabNav.Panel id="project-panel">
   *   <main>The page of the active link.</main>
   * </TabNav.Panel>
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The id of the panel, the same as the `tabPanel` of the Root. The panel can sit anywhere in the page.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly id: string;
  /**
   * Whether a link is active. The active link names the panel, with the id `<id>-tab` unless the link has its own
   * `id`.
   *
   * Set it to `false` while no link is active, so that the panel has no `aria-labelledby` that points to nothing.
   * Read it from the same router state that sets the `active` of each link.
   *
   * An `aria-labelledby` you pass wins. In development, a panel whose label is missing logs a warning.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly hasActiveLink?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TabNavRenderProps, TabNavState> | undefined;
}

/** Props of the {@link TabNavLink}. Native `a` props pass through. */
export interface TabNavLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'color'> {
  /**
   * The text of the link, which is also its accessible name. When not set, the link has no name, so you must give
   * it an `aria-label`.
   *
   * @example
   * <TabNav.Link href="/overview">Overview</TabNav.Link>
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether this link is the current page. Read it from the router. It sets `aria-current="page"` and
   * `data-active`, and the indicator moves to it.
   *
   * @defaultValue false
   */
  readonly active?: boolean | undefined;
  /**
   * Whether the link is disabled. It gets `aria-disabled="true"`, leaves the Tab and arrow key order, and does not
   * go to its page.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element such as a router link, or a function of the merged
   * props and the state of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. The element form works from a Server Component; the function
   * form does not.
   *
   * @example
   * <TabNav.Link render={<Link to="/overview" />} active>
   *   Overview
   * </TabNav.Link>
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: ReactElement | ((props: TabNavRenderProps, state: TabNavLinkState) => ReactElement) | undefined;
}

/** A TabNav part: a function component with its `displayName`. */
export interface TabNavPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
