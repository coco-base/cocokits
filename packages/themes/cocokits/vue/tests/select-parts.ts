import { h, type VNode } from 'vue';
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '../src/index';

/** An item with its indicator and its text. */
export const item = (value: string, text = value): VNode =>
  h(SelectItem, { value }, () => [h(SelectItemIndicator), h(SelectItemText, null, () => text)]);

/** What the parts around the items can change. */
export interface PartsOptions {
  /** The items; a cake and a pizza by default. */
  readonly items?: () => VNode[];
  /** The default slot of the value. */
  readonly valueSlot?: (props: unknown) => unknown;
}

/**
 * The trigger (named `Dish`, with the value and the icon) and the content around the items, for a themed
 * `SelectRoot` to hold.
 */
export const selectParts = ({ items = () => [item('Cake'), item('Pizza')], valueSlot }: PartsOptions = {}): VNode[] => [
  h(SelectTrigger, { 'aria-label': 'Dish' }, () => [
    h(SelectValue, { placeholder: 'Choose a dish' }, valueSlot ? { default: valueSlot } : undefined),
    h(SelectIcon),
  ]),
  h(SelectContent, null, items),
];
