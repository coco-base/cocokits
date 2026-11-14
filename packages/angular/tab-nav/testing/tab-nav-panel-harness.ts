import { ContentContainerComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';

/** Criteria that narrow the panels a {@link CckTabNavPanelHarness} finds. */
export type CckTabNavPanelHarnessFilters = BaseHarnessFilters;

/** Harness for the panel a Tab nav controls. */
export class CckTabNavPanelHarness extends ContentContainerComponentHarness {
  /** The selector of a Tab nav panel. */
  static hostSelector = '.cck-tab-nav__panel';

  /**
   * Gets a `HarnessPredicate` that finds panels with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckTabNavPanelHarnessFilters = {}): HarnessPredicate<CckTabNavPanelHarness> {
    return new HarnessPredicate(CckTabNavPanelHarness, options);
  }

  /** Gets the text of the panel. */
  async getTextContent(): Promise<string> {
    return (await this.host()).text();
  }
}
