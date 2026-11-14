import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';
import type { TabNavLinkState } from '@cocokits/machines/tab-nav';

/**
 * The navigation tabs. It renders a `<nav>` landmark that holds a `TabNavList`. Name it with `aria-label`, which
 * falls through to the `<nav>` as every native attribute does.
 *
 * Give `tabPanel` the id of a `TabNavPanel` for panel mode. The list then becomes a `tablist`, and the links become
 * tabs with one Tab stop and the arrow keys.
 *
 * @example
 * <TabNavRoot aria-label="Account" tab-panel="account-panel">
 *   <TabNavList>
 *     <TabNavLink href="/profile" active>Profile</TabNavLink>
 *     <TabNavLink href="/billing">Billing</TabNavLink>
 *     <TabNavIndicator />
 *   </TabNavList>
 * </TabNavRoot>
 * <TabNavPanel id="account-panel">The routed page.</TabNavPanel>
 *
 * @cckPart root
 */
export interface TabNavRootProps {
  /**
   * The `id` of the `TabNavPanel` that the links control, usually around a router outlet. When not set, the links
   * are plain links.
   *
   * With it, the list is a `tablist`, and each link is a `tab` with `aria-selected` and `aria-controls`. The active
   * link is the one Tab stop, or the first enabled link when none is active.
   *
   * @cckSemantic tab-nav.tabPanel
   * @cckParity Not available in every framework.
   */
  readonly tabPanel?: string | undefined;
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
 * The `<div>` that holds the links and the `TabNavIndicator`, as direct children. Without a panel, it has no role.
 *
 * In panel mode, when the root has a `tabPanel`, it is the `tablist`. The arrow keys, Home and End then move the
 * focus between the enabled links, without navigating. They go round from the end to the start, and the horizontal
 * arrows swap in right-to-left. The focused link scrolls into view when the list overflows.
 *
 * @example
 * <TabNavList>
 *   <TabNavLink href="/profile" active>Profile</TabNavLink>
 * </TabNavList>
 *
 * @cckPart list
 */
export interface TabNavListProps {
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
 * One link of the TabNav. It renders an `<a>` and navigates natively. The active link has `aria-current="page"` and
 * `data-active`.
 *
 * Without a `tabPanel` on the root, there are no tab roles and no arrow keys. Tab moves between the links, and Enter
 * follows one.
 *
 * With a `tabPanel`, the link is a `tab` with `aria-selected` and `aria-controls`, and no `aria-current`. The one Tab
 * stop is the active link, or else the first enabled one. The arrow keys, Home and End move the focus and never
 * navigate, and Space activates the link. The active link gets the id `<panel id>-tab`, unless you pass an `id`.
 *
 * With `asChild`, it merges onto a router link. The child must render an `<a>`. Its own props win, except
 * `aria-current`, `aria-disabled`, `tabindex` and the state markers.
 *
 * @example
 * <TabNavLink href="/profile" active>Profile</TabNavLink>
 *
 * @example
 * <TabNavLink as-child active>
 *   <RouterLink to="/profile">Profile</RouterLink>
 * </TabNavLink>
 *
 * @cckPart link
 */
export interface TabNavLinkProps extends Pick<TabNavLinkState, 'active' | 'disabled'> {
  /**
   * Whether this link is the link of the current page. It renders `aria-current="page"` and `data-active`, and the
   * indicator follows it. Your router decides, because the link does not read the location.
   *
   * @cckSemantic tab-nav.link.active
   * @defaultValue false
   */
  readonly active?: boolean | undefined;
  /**
   * Whether the link is disabled. It does not navigate, gets `aria-disabled="true"` and leaves the Tab order.
   *
   * @cckSemantic tab-nav.link.disabled
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
 * The `<span>` that marks the active link, for decoration. Place it as a direct child of `TabNavList`, after the
 * links. Without it, no indicator is rendered.
 *
 * After mount, it gets `--active-tab-left`, `--active-tab-top`, `--active-tab-width` and `--active-tab-height`: the
 * box of the active link inside the list. They stay current when the list or a link changes size.
 *
 * With `as`, the part keeps its class and `aria-hidden`.
 *
 * @example
 * <TabNavIndicator />
 *
 * @cckPart indicator
 */
export interface TabNavIndicatorProps {
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
 * The `<div role="tabpanel">` that the links of a `TabNavRoot` with `tabPanel` control, usually around a router
 * outlet. It can sit anywhere in the page. It has `tabindex="0"`, so Tab reaches it.
 *
 * While `hasActiveLink` is `true`, the active link names it with `aria-labelledby="<id>-tab"`. An `aria-labelledby`
 * you pass wins.
 *
 * @example
 * <TabNavPanel id="account-panel">The routed page.</TabNavPanel>
 *
 * @cckPart panel
 */
export interface TabNavPanelProps {
  /**
   * The id of the panel. It is the `tabPanel` of the root, and the target of the `aria-controls` of each link.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly id: string;
  /**
   * Whether a link is active. While `false`, the panel renders no `aria-labelledby`, so it points at no missing id.
   * Set it from the same router state that sets the `active` of each link.
   *
   * The panel is not inside the root, so it cannot learn the active link from it.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly hasActiveLink?: boolean | undefined;
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
