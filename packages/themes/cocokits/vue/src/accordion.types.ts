import type { AccordionRootProps as BaseAccordionRootProps } from '@cocokits/vue/accordion';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AccordionOptions = CocokitsThemeConfig['components']['accordion'];

/** The `variant` values of the cocokits theme. */
export type AccordionVariant = AccordionOptions['variant']['values'][number];
/** The `size` values of the cocokits theme. */
export type AccordionSize = AccordionOptions['size']['values'][number];
/** The `togglePosition` values of the cocokits theme. */
export type AccordionTogglePosition = AccordionOptions['togglePosition']['values'][number];
/** The `hideToggle` values of the cocokits theme. */
export type AccordionHideToggle = AccordionOptions['hideToggle']['values'][number];

/**
 * Props of the cocokits AccordionRoot. It renders the base AccordionRoot and supplies `variant`, `size`,
 * `togglePosition` and `hideToggle` to it, which renders the `data-*` attributes on the root. Each option resolves as
 * own option, then `ThemeProvider` override, then config default; `null` removes the attribute. Bind the value with
 * `v-model`; native attributes and listeners fall through to the base.
 *
 * @example
 * <AccordionRoot v-model="open" collapsible variant="group" size="sm" toggle-position="before">
 *   <AccordionItem value="shipping">
 *     <AccordionHeader><AccordionTrigger>Shipping</AccordionTrigger></AccordionHeader>
 *     <AccordionContent>Orders leave in two days.</AccordionContent>
 *   </AccordionItem>
 * </AccordionRoot>
 * @cckPart root
 */
export interface AccordionRootProps extends BaseAccordionRootProps {
  /**
   * Look of the sections: separate bordered items, one bordered group, or no chrome.
   */
  readonly variant?: AccordionVariant | null | undefined;
  /**
   * Height, padding and text of the triggers.
   */
  readonly size?: AccordionSize | null | undefined;
  /**
   * Whether the chevron follows the label or precedes it, in the writing direction.
   */
  readonly togglePosition?: AccordionTogglePosition | null | undefined;
  /**
   * Hides the chevron.
   */
  readonly hideToggle?: AccordionHideToggle | null | undefined;
}
