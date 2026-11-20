import type {
  SelectContentEmits as BaseSelectContentEmits,
  SelectContentProps as BaseSelectContentProps,
  SelectRootProps as BaseSelectRootProps,
} from '@cocokits/vue/select';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type SelectSize = SelectOptions['size']['values'][number];
/** The `indicator` values of the cocokits theme. */
export type SelectIndicator = SelectOptions['indicator']['values'][number];

/**
 * Props of the cocokits SelectRoot. It renders the base SelectRoot and supplies `size` and `indicator` to it, which
 * render `data-size` on the root and `data-indicator` on the list. Each option resolves as own option, then (for
 * `size`) the size of the `FormField` around it, then `ThemeProvider` override, then config default; `null` removes
 * the attribute. Bind the value with
 * `v-model`; native attributes and listeners fall through to the base.
 *
 * @example
 * <SelectRoot v-model="dish" size="lg">
 *   <SelectTrigger aria-label="Dish"><SelectValue placeholder="Choose a dish" /><SelectIcon /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="Cake"><SelectItemIndicator /><SelectItemText>Cake</SelectItemText></SelectItem>
 *   </SelectContent>
 * </SelectRoot>
 *
 * @typeParam T - The type of an item's value. Defaults to `string`.
 * @typeParam M - The type of `multiple`: `true` makes the value a list. Defaults to `false`.
 * @cckPart root
 */
export interface SelectRootProps<T = string, M extends boolean = false> extends BaseSelectRootProps<T, M> {
  /**
   * Height, padding and text of the trigger. Inside a `FormField` it takes the size of the field.
   */
  readonly size?: SelectSize | null | undefined;
  /**
   * Mark of the selected option, rendered on the list: a check after the text, a box before it, or none. Without it
   * a single list shows a check and a multiple list a box.
   */
  readonly indicator?: SelectIndicator | null | undefined;
}

/**
 * Props of the cocokits SelectContent. It renders the base SelectContent and draws the list, from the `size` and `indicator` of its `SelectRoot`. It has no option of its own.
 *
 * @example
 * <SelectContent><SelectItem value="Cake"><SelectItemText>Cake</SelectItemText></SelectItem></SelectContent>
 * @cckPart content
 */
export type SelectContentProps = BaseSelectContentProps;

/** Events of the cocokits SelectContent: the events of the base SelectContent. */
export type SelectContentEmits = BaseSelectContentEmits;
