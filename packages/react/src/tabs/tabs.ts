import { TabsContent } from './tabs-content';
import { TabsIndicator } from './tabs-indicator';
import { TabsList } from './tabs-list';
import { TabsRoot } from './tabs-root';
import { TabsTrigger } from './tabs-trigger';
import type {
  TabsContentProps,
  TabsIndicatorProps,
  TabsListProps,
  TabsPart,
  TabsRootProps,
  TabsTriggerProps,
} from './tabs.types';

/** The shape of the {@link Tabs} namespace. */
interface TabsNamespace {
  readonly Root: TabsPart<TabsRootProps>;
  readonly List: TabsPart<TabsListProps>;
  readonly Trigger: TabsPart<TabsTriggerProps>;
  readonly Indicator: TabsPart<TabsIndicatorProps>;
  readonly Content: TabsPart<TabsContentProps>;
}

/**
 * The Tabs parts as a namespace: `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Indicator` and `Tabs.Content`. A
 * list of tabs, each showing one panel, for switching between views of the same content.
 */
export const Tabs: TabsNamespace = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Indicator: TabsIndicator,
  Content: TabsContent,
};
