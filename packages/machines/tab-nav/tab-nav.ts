import { resolveTabStop } from '@cocokits/cdk/roving-focus';
import { dataAttr } from '@cocokits/utils';
import { linkClickGuard } from '../button';
import { tabNavAnatomy } from './tab-nav.anatomy';
import type {
  TabNavLinkProps,
  TabNavLinkState,
  TabNavPanelProps,
  TabNavPanelState,
  TabNavParts,
  TabNavState,
} from './tab-nav.types';

/**
 * The id the active link gets in panel mode when the author gave none, and the id the panel then points at.
 *
 * @param panelId - The panel id.
 * @returns `<panel id>-tab`.
 */
export function tabNavLinkId(panelId: string): string {
  return `${panelId}-tab`;
}

/**
 * Picks the one link that holds the Tab stop in panel mode: the active link, else the first enabled link.
 * Computed from the links alone, so the server and the client agree.
 *
 * @param links - The links in document order.
 * @returns The index of the tab stop, or `-1` when every link is disabled.
 */
export function resolveTabNavStop(links: readonly Pick<TabNavLinkState, 'active' | 'disabled'>[]): number {
  return resolveTabStop(
    links.map((link) => ({ disabled: link.disabled === true })),
    links.findIndex((link) => link.active === true),
  );
}

function linkProps(panelId: string | undefined, { active, disabled, id, tabStop }: TabNavLinkState): TabNavLinkProps {
  const common = {
    class: tabNavAnatomy.classes.link,
    'aria-disabled': disabled ? ('true' as const) : undefined,
    'data-active': dataAttr(active),
    'data-disabled': dataAttr(disabled),
    onClick: disabled ? linkClickGuard : undefined,
  };
  if (panelId === undefined) {
    return { ...common, 'aria-current': active ? 'page' : undefined, tabIndex: disabled ? -1 : undefined };
  }
  return {
    ...common,
    id: id ?? (active ? tabNavLinkId(panelId) : undefined),
    role: 'tab',
    'aria-selected': active ? 'true' : 'false',
    'aria-controls': panelId,
    tabIndex: tabStop && !disabled ? 0 : -1,
  };
}

function panelProps({ id, activeLinkId, hasActiveLink }: TabNavPanelState): TabNavPanelProps {
  return {
    class: tabNavAnatomy.classes.panel,
    id,
    role: 'tabpanel',
    'aria-labelledby': hasActiveLink === false ? undefined : (activeLinkId ?? tabNavLinkId(id)),
    tabIndex: 0,
  };
}

/**
 * Computes the props of every TabNav part. Pure: no DOM, same result on the server and the client. The
 * machine has no state. Without a `panelId` the links are plain links (`aria-current="page"` on the active
 * one, no tab roles). With one, the list is a `tablist`, the links are `tab`s with `aria-selected` and
 * `aria-controls`, and the adapter moves focus between them with the roving focus.
 *
 * @param state - Leave out for link mode; give `panelId` for panel mode.
 * @returns The props of the fixed parts, a function that gives the props of one link and one for the panel.
 */
export function getTabNavProps(state: TabNavState = {}): TabNavParts {
  const { classes } = tabNavAnatomy;
  const { panelId } = state;
  return {
    root: { class: classes.root },
    list: panelId === undefined ? { class: classes.list } : { class: classes.list, role: 'tablist' },
    indicator: { class: classes.indicator, 'aria-hidden': 'true' },
    link: (link: TabNavLinkState) => linkProps(panelId, link),
    panel: panelProps,
  };
}
