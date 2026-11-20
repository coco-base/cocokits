import { TabNavIndicator } from './tab-nav-indicator';
import { TabNavLink } from './tab-nav-link';
import { TabNavList } from './tab-nav-list';
import { TabNavPanel } from './tab-nav-panel';
import { TabNavRoot } from './tab-nav-root';
import type {
  TabNavIndicatorProps,
  TabNavLinkProps,
  TabNavListProps,
  TabNavPanelProps,
  TabNavPart,
  TabNavRootProps,
} from './tab-nav.types';

/** The shape of the {@link TabNav} namespace. */
interface TabNavNamespace {
  readonly Root: TabNavPart<TabNavRootProps>;
  readonly List: TabNavPart<TabNavListProps>;
  readonly Link: TabNavPart<TabNavLinkProps>;
  readonly Indicator: TabNavPart<TabNavIndicatorProps>;
  readonly Panel: TabNavPart<TabNavPanelProps>;
}

/**
 * The TabNav parts as a namespace: `TabNav.Root`, `TabNav.List`, `TabNav.Link`, `TabNav.Indicator` and
 * `TabNav.Panel`. Navigation links that look like tabs; each link goes to a page, so they stay links and are not
 * tabs unless the Root is linked to a panel.
 */
export const TabNav: TabNavNamespace = {
  Root: TabNavRoot,
  List: TabNavList,
  Link: TabNavLink,
  Indicator: TabNavIndicator,
  Panel: TabNavPanel,
};
