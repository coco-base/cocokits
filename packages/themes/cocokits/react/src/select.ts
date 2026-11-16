import { Select as BaseSelect } from '@cocokits/react/select';
import { SelectRoot, type SelectRootComponent } from './select-root';

/** The cocokits {@link Select} parts: the themed `Root` and the base parts. */
interface SelectNamespace {
  readonly Root: SelectRootComponent;
  readonly Trigger: typeof BaseSelect.Trigger;
  readonly Value: typeof BaseSelect.Value;
  readonly Icon: typeof BaseSelect.Icon;
  readonly Content: typeof BaseSelect.Content;
  readonly Item: typeof BaseSelect.Item;
  readonly ItemText: typeof BaseSelect.ItemText;
  readonly ItemIndicator: typeof BaseSelect.ItemIndicator;
  readonly Group: typeof BaseSelect.Group;
  readonly Label: typeof BaseSelect.Label;
  readonly Separator: typeof BaseSelect.Separator;
  readonly Header: typeof BaseSelect.Header;
  readonly Search: typeof BaseSelect.Search;
  readonly Empty: typeof BaseSelect.Empty;
  readonly Footer: typeof BaseSelect.Footer;
  readonly Count: typeof BaseSelect.Count;
  readonly OptionDescription: typeof BaseSelect.OptionDescription;
  readonly OptionLeading: typeof BaseSelect.OptionLeading;
}

/**
 * The cocokits Select as a namespace: the themed `Select.Root` and the base `Select.Trigger`, `Select.Value`,
 * `Select.Icon`, `Select.Content`, `Select.Item`, `Select.ItemText`, `Select.ItemIndicator`, `Select.Group`,
 * `Select.Label`, `Select.Separator`, `Select.Header`, `Select.Search`, `Select.Empty`, `Select.Footer`,
 * `Select.Count`, `Select.OptionDescription` and `Select.OptionLeading`, which the theme styles through the option of
 * the root.
 */
export const Select: SelectNamespace = {
  Root: SelectRoot,
  Trigger: BaseSelect.Trigger,
  Value: BaseSelect.Value,
  Icon: BaseSelect.Icon,
  Content: BaseSelect.Content,
  Item: BaseSelect.Item,
  ItemText: BaseSelect.ItemText,
  ItemIndicator: BaseSelect.ItemIndicator,
  Group: BaseSelect.Group,
  Label: BaseSelect.Label,
  Separator: BaseSelect.Separator,
  Header: BaseSelect.Header,
  Search: BaseSelect.Search,
  Empty: BaseSelect.Empty,
  Footer: BaseSelect.Footer,
  Count: BaseSelect.Count,
  OptionDescription: BaseSelect.OptionDescription,
  OptionLeading: BaseSelect.OptionLeading,
};
