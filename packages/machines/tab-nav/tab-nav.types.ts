import type { ButtonClickEvent } from '../button';

/** Inputs of `getTabNavProps`. */
export interface TabNavState {
  /**
   * The `id` of the linked panel. Giving it enters panel mode: the list is a `tablist`, the links are `tab`s
   * and the panel is a `tabpanel`. Leave it out for link mode.
   */
  readonly panelId?: string | undefined;
}

/** Inputs of one link. A missing fact is `false`. */
export interface TabNavLinkState {
  /** The link of the current page, from the router. */
  readonly active?: boolean | undefined;
  /** The link does not navigate and is out of the tab order. */
  readonly disabled?: boolean | undefined;
  /** The author's link id. In panel mode the active link without one gets `<panel id>-tab`. */
  readonly id?: string | undefined;
  /** Panel mode only: this link holds the one tab stop; see `resolveTabNavStop`. */
  readonly tabStop?: boolean | undefined;
}

/** Inputs of the panel. */
export interface TabNavPanelState {
  /** The panel id; the root's `panelId` links to it. */
  readonly id: string;
  /** The id of the active link, when the adapter knows it (Angular); else `<panel id>-tab`. */
  readonly activeLinkId?: string | undefined;
  /** `false` when no link is active: the panel then renders no `aria-labelledby`. @defaultValue true */
  readonly hasActiveLink?: boolean | undefined;
}

/** Props shared by every part. */
export interface TabNavPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the list. */
export interface TabNavListProps extends TabNavPartProps {
  /** `'tablist'` in panel mode; absent in link mode. */
  readonly role?: 'tablist';
}

/** Props of the decorative indicator. */
export interface TabNavIndicatorProps extends TabNavPartProps {
  /** Always `'true'`. */
  readonly 'aria-hidden': 'true';
}

/** Props of one link. Absent keys are `undefined`. */
export interface TabNavLinkProps extends TabNavPartProps {
  /** Panel mode: the author's id, else `<panel id>-tab` on the active link. */
  readonly id?: string | undefined;
  /** `'tab'` in panel mode. */
  readonly role?: 'tab' | undefined;
  /** Panel mode: `'true'` on the active link, `'false'` elsewhere. */
  readonly 'aria-selected'?: 'true' | 'false' | undefined;
  /** Panel mode: the panel id. */
  readonly 'aria-controls'?: string | undefined;
  /** Link mode: `'page'` on the active link. Never set in panel mode. */
  readonly 'aria-current'?: 'page' | undefined;
  /** `'true'` on a disabled link. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** `-1` on a disabled link (link mode); `0` on the tab stop and `-1` elsewhere in panel mode. */
  readonly tabIndex?: 0 | -1 | undefined;
  /** Present on the active link. */
  readonly 'data-active'?: '' | undefined;
  /** Present on a disabled link. */
  readonly 'data-disabled'?: '' | undefined;
  /**
   * Present on a disabled link only: prevents the navigation. An adapter runs it before any other click
   * listener of the host (the capture phase), after a consumer handler that may veto with `preventDefault()`.
   */
  readonly onClick?: ((event: ButtonClickEvent) => void) | undefined;
}

/** Props of the panel. */
export interface TabNavPanelProps extends TabNavPartProps {
  /** The panel id. */
  readonly id: string;
  /** Always `'tabpanel'`. */
  readonly role: 'tabpanel';
  /** The active link's id; absent while no link is active. */
  readonly 'aria-labelledby'?: string | undefined;
  /** Always `0`: the panel is reachable by Tab. */
  readonly tabIndex: 0;
}

/** What `getTabNavProps` returns. */
export interface TabNavParts {
  /** The `nav` props. */
  readonly root: TabNavPartProps;
  /** The list props. */
  readonly list: TabNavListProps;
  /** The indicator props. */
  readonly indicator: TabNavIndicatorProps;
  /** The props of one link. */
  readonly link: (state: TabNavLinkState) => TabNavLinkProps;
  /** The props of the panel. */
  readonly panel: (state: TabNavPanelState) => TabNavPanelProps;
}
