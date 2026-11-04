import { SelectContent } from './select-content';
import { SelectGroup } from './select-group';
import { SelectIcon } from './select-icon';
import { SelectItem } from './select-item';
import { SelectItemIndicator } from './select-item-indicator';
import { SelectItemText } from './select-item-text';
import { SelectLabel } from './select-label';
import { SelectRoot } from './select-root';
import { SelectSeparator } from './select-separator';
import { SelectTrigger } from './select-trigger';
import { SelectValue } from './select-value';
import type {
  SelectContentProps,
  SelectGroupProps,
  SelectIconProps,
  SelectItemComponent,
  SelectItemIndicatorProps,
  SelectItemTextProps,
  SelectLabelProps,
  SelectPart,
  SelectRootComponent,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueComponent,
} from './select.types';

/** The shape of the {@link Select} namespace. */
interface SelectNamespace {
  readonly Root: SelectRootComponent;
  readonly Trigger: SelectPart<SelectTriggerProps>;
  readonly Value: SelectValueComponent;
  readonly Icon: SelectPart<SelectIconProps>;
  readonly Content: SelectPart<SelectContentProps>;
  readonly Item: SelectItemComponent;
  readonly ItemText: SelectPart<SelectItemTextProps>;
  readonly ItemIndicator: SelectPart<SelectItemIndicatorProps>;
  readonly Group: SelectPart<SelectGroupProps>;
  readonly Label: SelectPart<SelectLabelProps>;
  readonly Separator: SelectPart<SelectSeparatorProps>;
}

/**
 * The Select parts as a namespace: `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Icon`,
 * `Select.Content`, `Select.Item`, `Select.ItemText`, `Select.ItemIndicator`, `Select.Group`, `Select.Label` and
 * `Select.Separator`. A custom listbox in a positioned overlay; the Root holds the value and the open state, the
 * Trigger shows the selection and the Content renders the list.
 */
export const Select: SelectNamespace = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Content: SelectContent,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
};
