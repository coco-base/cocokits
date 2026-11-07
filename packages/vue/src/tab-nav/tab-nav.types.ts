import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';
import type { TabNavLinkState } from '@cocokits/machines/tab-nav';

/**
 * The navigation tabs: the `nav` landmark. Name it with `aria-label`, which falls through to the `nav` like every
 * native attribute. It takes a `TabNavList` in its default slot. Give `tabPanel` the id of a `TabNavPanel` to enter
 * panel mode: the list becomes a `tablist`, the links `tab`s with one Tab stop and arrow keys.
 *
 * @example
 * <TabNavRoot aria-label="Account">
 *   <TabNavList>
 *     <TabNavLink href="/profile" active>Profile</TabNavLink>
 *     <TabNavLink href="/billing">Billing</TabNavLink>
 *     <TabNavIndicator />
 *   </TabNavList>
 * </TabNavRoot>
 *
 * @cckPart root
 */
export interface TabNavRootProps {
  /**
   * The `id` of the `TabNavPanel` the links drive, usually around a router outlet. Giving it enters panel mode: the
   * list is a `tablist`, each link a `tab` with `aria-selected` and `aria-controls`, and the active link or, with
   * none active, the first enabled link is the one Tab stop. Leave it out for plain links.
   *
   * @cckSemantic tab-nav.tabPanel
   * @cckParity Not available in every framework.
   */
  readonly tabPanel?: string | undefined;
  /**
   * The tag or component to render, in place of the `nav`. The part keeps its state.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'nav'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto its first element or component child instead of rendering a `nav`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `div` that holds the links and the `TabNavIndicator`, as direct children. In panel mode (the root has a
 * `tabPanel`) it is the `tablist`, and the arrow keys, Home and End move focus between the enabled links, wrapping
 * and flipped in right-to-left, without navigating; the link is scrolled into view when the list overflows. Without
 * a panel it has no role.
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
   * The tag or component to render, in place of the `div`. The part keeps its role and handlers. Ignored with
   * `asChild`.
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
 * One link of the TabNav. It renders an `<a>` and navigates natively; the active one has `aria-current="page"`
 * and `data-active`. Without a `tabPanel` on the root there are no tab roles and no arrow-key handling: Tab moves
 * between the links and Enter follows one. With a `tabPanel` the link is a `tab` (`aria-selected`,
 * `aria-controls`, no `aria-current`) and the one Tab stop is the active link, else the first enabled one; the arrow
 * keys, Home and End move focus (never navigate) and Space activates it. The active link gets the id
 * `<panel id>-tab` unless you pass an `id`. With `asChild` it merges onto a router link.
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
   * Whether this link is the one of the current page. It renders `aria-current="page"` and `data-active`, and
   * the indicator follows it. The router decides; the link does not read the location.
   *
   * @cckSemantic tab-nav.link.active
   * @defaultValue false
   */
  readonly active?: boolean | undefined;
  /**
   * Whether the link is disabled: it does not navigate, gets `aria-disabled="true"` and leaves the tab order.
   *
   * @cckSemantic tab-nav.link.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `a`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'a'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the link merges onto its first element or component child (a router link) instead of rendering an
   * `<a>`. The child must render an `<a>`; its own props win except the `aria-current`, `aria-disabled`,
   * `tabindex` and state markers.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The decorative `span` that marks the active link. Place it as a direct child of `TabNavList`, after the links;
 * without it no indicator is rendered. After mount the base writes `--active-tab-left`, `--active-tab-top`,
 * `--active-tab-width` and `--active-tab-height` on it, the box of the active link inside the list, and keeps them
 * current when the list or any link resizes.
 *
 * @example
 * <TabNavIndicator />
 *
 * @cckPart indicator
 */
export interface TabNavIndicatorProps {
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

/**
 * The `div role="tabpanel"` that the links of a `TabNavRoot` with `tabPanel` drive, usually around a router outlet. It
 * may sit anywhere in the page. It is reachable with Tab (`tabindex="0"`) and labelled by the active link
 * (`aria-labelledby="<id>-tab"`) while `hasActiveLink` is `true`; an `aria-labelledby` you pass wins.
 *
 * @example
 * <TabNavPanel id="account-panel">The routed page.</TabNavPanel>
 *
 * @cckPart panel
 */
export interface TabNavPanelProps {
  /**
   * The id of the panel: the `tabPanel` of the root, and the target of each link's `aria-controls`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly id: string;
  /**
   * Whether a link is active. While `false` the panel renders no `aria-labelledby`, so no reference dangles. Set it
   * from the same router state that sets each link's `active`.
   *
   * @cckSemantic none
   * @remarks The panel is not inside the root, so it cannot learn the active link from it.
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly hasActiveLink?: boolean | undefined;
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
   * Whether the panel merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
