import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';

/**
 * The props the function form of a part's `render` receives: the native props merged with the part's own. Spread
 * all of them, including `ref`, onto one element.
 */
export interface TabNavRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-active` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/** The public state of the Root, the List, the Indicator and the Panel, passed to the function form of `render`. */
export interface TabNavState {
  /** Whether the nav is linked to a panel (`tabPanel`), so its links are tabs. */
  readonly panelMode: boolean;
}

/** The public state of one Link, passed to the function form of `render`. */
export interface TabNavLinkState {
  /** Whether this link is the current page. */
  readonly active: boolean;
  /** Whether this link is disabled. */
  readonly disabled: boolean;
}

/** The `render` prop of a part: an element, or a function of the merged props and the part's state. */
type RenderProp<S> = ReactElement | ((props: TabNavRenderProps, state: S) => ReactElement);

/** Props of the {@link TabNavRoot}. Native `nav` props pass through; name the landmark with `aria-label`. */
export interface TabNavRootProps extends Omit<ComponentPropsWithRef<'nav'>, 'color'> {
  /**
   * The parts: a `TabNav.List` with the `TabNav.Link` parts and the optional `TabNav.Indicator` inside it.
   *
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The accessible name of the navigation landmark. A page with more than one navigation needs it.
   *
   * @cckSemantic none
   * @cckParity A native attribute of the `nav`; Angular and Vue take it as a plain attribute too.
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The `id` of the `TabNav.Panel` the links drive, which enters panel mode: the list is a `tablist`, the links are
   * `tab`s with one Tab stop and arrow keys, and the panel is a `tabpanel`. Leave it out for plain links.
   *
   * @cckSemantic tab-nav.tabPanel
   * @cckParity React and Vue pass the panel's id; Angular passes the `cckTabNavPanel` directive (`tabPanel`).
   */
  readonly tabPanel?: string | undefined;
  /**
   * Replaces the rendered `<nav>`: an element, or a function of the merged props and the {@link TabNavState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabNavState> | undefined;
}

/** Props of the {@link TabNavList}. Native `div` props pass through. */
export interface TabNavListProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The `TabNav.Link` parts, and the `TabNav.Indicator` as a direct child.
   *
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the {@link TabNavState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular renders the list and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabNavState> | undefined;
}

/** Props of the {@link TabNavIndicator}. Native `span` props pass through. */
export interface TabNavIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the rendered `<span>`: an element, or a function of the merged props and the {@link TabNavState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular renders the indicator itself and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabNavState> | undefined;
}

/** Props of the {@link TabNavPanel}. Native `div` props pass through. */
export interface TabNavPanelProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the panel, usually the router outlet.
   *
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The id of the panel, the same as the Root's `tabPanel`. The panel may sit anywhere in the page.
   *
   * @cckSemantic none
   * @cckParity Angular takes the `cckTabNavPanel` directive itself (`id` input) and learns the active link from the nav.
   */
  readonly id: string;
  /**
   * Whether a link is active. The panel is labelled by the active link, whose id is `<id>-tab` unless the link has
   * its own `id`; set `false` when no link is active, so the panel renders no `aria-labelledby` that points at
   * nothing. Read it from the same router state that sets each link's `active`. An `aria-labelledby` you pass wins.
   * In development a panel whose label target is missing logs a `CocoKits:` warning.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity React and Vue only; the Angular panel learns it from the nav.
   */
  readonly hasActiveLink?: boolean | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the {@link TabNavState}. The
   * function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TabNavState> | undefined;
}

/** Props of the {@link TabNavLink}. Native `a` props pass through. */
export interface TabNavLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'color'> {
  /**
   * The link content, rendered inside the element as written.
   *
   * @cckSemantic tab-nav.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether this link is the current page, which the author reads from the router. It renders
   * `aria-current="page"` and `data-active`, and the indicator follows it.
   *
   * @defaultValue false
   */
  readonly active?: boolean | undefined;
  /**
   * Whether the link is disabled: it renders `aria-disabled="true"`, leaves the tab order and the arrow-key order
   * and does not navigate.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Replaces the rendered `<a>`: an element such as a router `<Link to="/" />`, or a function of the merged props
   * and the {@link TabNavLinkState}. The function form must spread all the props it receives, including `ref`,
   * onto one element. The element form works from a Server Component; the function form does not.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on the router's `a` and Vue uses `as` or `asChild`.
   */
  readonly render?: ReactElement | ((props: TabNavRenderProps, state: TabNavLinkState) => ReactElement) | undefined;
}

/** A TabNav part: a function component with its `displayName`. */
export interface TabNavPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
