import { TabNav as BaseTabNav } from '@cocokits/react/tab-nav';
import { TabNavRoot, type TabNavRootComponent } from './tab-nav-root';

/** The cocokits {@link TabNav} parts: the themed `Root` and the base `List`, `Link`, `Indicator` and `Panel`. */
interface TabNavNamespace {
  readonly Root: TabNavRootComponent;
  readonly List: typeof BaseTabNav.List;
  readonly Link: typeof BaseTabNav.Link;
  readonly Indicator: typeof BaseTabNav.Indicator;
  readonly Panel: typeof BaseTabNav.Panel;
}

/**
 * The cocokits TabNav as a namespace: the themed `TabNav.Root` and the base `TabNav.List`, `TabNav.Link`,
 * `TabNav.Indicator` and `TabNav.Panel`, which the theme styles through the options of the root.
 */
export const TabNav: TabNavNamespace = {
  Root: TabNavRoot,
  List: BaseTabNav.List,
  Link: BaseTabNav.Link,
  Indicator: BaseTabNav.Indicator,
  Panel: BaseTabNav.Panel,
};
