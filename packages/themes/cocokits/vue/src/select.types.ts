import type { SelectRootProps as BaseSelectRootProps } from '@cocokits/vue/select';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type SelectSize = SelectOptions['size']['values'][number];

/**
 * Props of the cocokits SelectRoot. It renders the base SelectRoot and supplies `size` to it, which renders
 * `data-size` on the root. The option resolves as own option, then `ThemeProvider` override, then config default;
 * `null` removes the attribute. Inside a FormField the field sets the size of the trigger. Bind the value with
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
   * Height, padding and text of the trigger.
   */
  readonly size?: SelectSize | null | undefined;
}
