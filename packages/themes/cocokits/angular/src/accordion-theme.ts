import { Directive, booleanAttribute, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AccordionOptions = CocokitsThemeConfig['components']['accordion'];

/** The `variant` values of the cocokits theme. */
export type CckAccordionVariant = AccordionOptions['variant']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckAccordionSize = AccordionOptions['size']['values'][number];
/** The `togglePosition` values of the cocokits theme. */
export type CckAccordionTogglePosition = AccordionOptions['togglePosition']['values'][number];
/** The `hideToggle` values of the cocokits theme. */
export type CckAccordionHideToggle = AccordionOptions['hideToggle']['values'][number];

/** Reads the attribute form: `hideToggle` alone and `hideToggle=""` mean true; `null` and `undefined` pass through. */
const toHideToggle = (
  value: CckAccordionHideToggle | string | null | undefined,
): CckAccordionHideToggle | null | undefined => (value == null ? value : booleanAttribute(value));

/**
 * The cocokits theme options of the Accordion. It sits on the same element as the base component
 * (`[cckAccordion]`) and provides the values to it; the base renders the `data-*` attributes on the root, and the
 * theme styles the items, the triggers and the contents from them. Each option resolves in order: the input, then
 * the `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <div cckAccordion variant="group" size="sm" togglePosition="before">
 *   <div cckAccordionItem label="Shipping">Orders leave in two days.</div>
 * </div>
 * @cckPart root
 */
@Directive({
  selector: '[cckAccordion]',
  providers: [
    provideThemeOptions(
      'accordion',
      forwardRef(() => CckAccordionTheme),
      (theme: CckAccordionTheme) => ({
        variant: theme.variant,
        size: theme.size,
        togglePosition: theme.togglePosition,
        hideToggle: theme.hideToggle,
      }),
    ),
  ],
})
export class CckAccordionTheme {
  /**
   * Look of the sections: separate bordered items, one bordered group, or no chrome.
   */
  readonly variant = input<CckAccordionVariant | null>();
  /**
   * Height, padding and text of the triggers.
   */
  readonly size = input<CckAccordionSize | null>();
  /**
   * Whether the chevron follows the label or precedes it, in the writing direction.
   */
  readonly togglePosition = input<CckAccordionTogglePosition | null>();
  /**
   * Hides the chevron.
   */
  readonly hideToggle = input<
    CckAccordionHideToggle | null | undefined,
    CckAccordionHideToggle | string | null | undefined
  >(undefined, { transform: toHideToggle });
}
