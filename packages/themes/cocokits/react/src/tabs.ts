import { Tabs as BaseTabs } from '@cocokits/react/tabs';
import { TabsRoot, type TabsRootComponent } from './tabs-root';

/** The cocokits {@link Tabs} parts: the themed `Root` and the base `List`, `Trigger`, `Indicator` and `Content`. */
interface TabsNamespace {
  readonly Root: TabsRootComponent;
  readonly List: typeof BaseTabs.List;
  readonly Trigger: typeof BaseTabs.Trigger;
  readonly Indicator: typeof BaseTabs.Indicator;
  readonly Content: typeof BaseTabs.Content;
}

/**
 * The cocokits Tabs as a namespace: the themed `Tabs.Root` and the base `Tabs.List`, `Tabs.Trigger`,
 * `Tabs.Indicator` and `Tabs.Content`, which the theme styles through the options of the root.
 */
export const Tabs: TabsNamespace = {
  Root: TabsRoot,
  List: BaseTabs.List,
  Trigger: BaseTabs.Trigger,
  Indicator: BaseTabs.Indicator,
  Content: BaseTabs.Content,
};
