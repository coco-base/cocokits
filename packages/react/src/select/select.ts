import type { ReactElement } from 'react';
import { SelectContent } from './select-content';
import { SelectEmpty } from './select-empty';
import { SelectFooter } from './select-footer';
import { SelectHeader } from './select-header';
import { SelectGroup } from './select-group';
import { SelectIcon } from './select-icon';
import { SelectItem } from './select-item';
import { SelectItemIndicator } from './select-item-indicator';
import { SelectItemText } from './select-item-text';
import { SelectLabel } from './select-label';
import { SelectOptionDescription } from './select-option-description';
import { SelectOptionLeading } from './select-option-leading';
import { SelectRoot } from './select-root';
import { SelectSearch } from './select-search';
import { SelectSeparator } from './select-separator';
import { SelectTrigger } from './select-trigger';
import { SelectValue } from './select-value';
import type { SelectPart, SelectRootComponent, SelectTriggerProps, SelectValueComponent } from './select.types';
import type {
  SelectEmptyProps,
  SelectFooterProps,
  SelectHeaderProps,
  SelectOptionDescriptionProps,
  SelectOptionLeadingProps,
  SelectSearchProps,
} from './select-extra-parts.types';
import type {
  SelectContentProps,
  SelectGroupProps,
  SelectIconProps,
  SelectItemComponent,
  SelectItemIndicatorProps,
  SelectItemTextProps,
  SelectLabelProps,
  SelectSeparatorProps,
} from './select-parts.types';

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
  readonly Header: SelectPart<SelectHeaderProps, ReactElement | null>;
  readonly Search: SelectPart<SelectSearchProps, ReactElement | null>;
  readonly Empty: SelectPart<SelectEmptyProps>;
  readonly Footer: SelectPart<SelectFooterProps>;
  readonly OptionDescription: SelectPart<SelectOptionDescriptionProps>;
  readonly OptionLeading: SelectPart<SelectOptionLeadingProps>;
}

/**
 * The Select parts as a namespace: `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Icon`,
 * `Select.Content`, `Select.Item`, `Select.ItemText`, `Select.ItemIndicator`, `Select.Group`, `Select.Label`,
 * `Select.Separator`, `Select.Header`, `Select.Search`, `Select.Empty`, `Select.Footer`,
 * `Select.OptionDescription` and `Select.OptionLeading`. A custom listbox in a positioned overlay; the Root holds the value and the open state, the
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
  Header: SelectHeader,
  Search: SelectSearch,
  Empty: SelectEmpty,
  Footer: SelectFooter,
  OptionDescription: SelectOptionDescription,
  OptionLeading: SelectOptionLeading,
};
