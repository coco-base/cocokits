import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';
import { CckAccordionItemHarness, type CckAccordionItemHarnessFilters } from './accordion-item-harness';

/** Criteria that narrow the Accordions a {@link CckAccordionHarness} finds. */
export type CckAccordionHarnessFilters = BaseHarnessFilters;

/** Harness for an Accordion root. */
export class CckAccordionHarness extends ComponentHarness {
  /** The selector of the Accordion root. */
  static hostSelector = '.cck-accordion';

  /**
   * Gets a `HarnessPredicate` that finds Accordions with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckAccordionHarnessFilters = {}): HarnessPredicate<CckAccordionHarness> {
    return new HarnessPredicate(CckAccordionHarness, options);
  }

  /**
   * Gets the items.
   *
   * @param filter - The criteria.
   * @returns The matching items.
   */
  async getItems(filter: CckAccordionItemHarnessFilters = {}): Promise<CckAccordionItemHarness[]> {
    return this.locatorForAll(CckAccordionItemHarness.with(filter))();
  }

  /**
   * Whether several items can be open at once.
   *
   * @returns `true` when the Accordion has `multi`.
   */
  async isMulti(): Promise<boolean> {
    return (await this.host()).getAttribute('data-multiple').then((value) => value !== null);
  }
}
