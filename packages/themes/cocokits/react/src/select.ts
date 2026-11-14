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
}

/**
 * The cocokits Select as a namespace: the themed `Select.Root` and the base `Select.Trigger`, `Select.Value`,
 * `Select.Icon`, `Select.Content`, `Select.Item`, `Select.ItemText`, `Select.ItemIndicator`, `Select.Group`,
 * `Select.Label` and `Select.Separator`, which the theme styles through the option of the root.
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
};
