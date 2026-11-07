import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';
import { CckTabHarness, type CckTabHarnessFilters } from './tab-harness';

/** Criteria that narrow the Tabs a {@link CckTabsHarness} finds. */
export interface CckTabsHarnessFilters extends BaseHarnessFilters {
  /** Only Tabs whose selected tab has this label (a string or a pattern). */
  selectedTabLabel?: string | RegExp;
}

/** Harness for a Tabs root. */
export class CckTabsHarness extends ComponentHarness {
  /** The selector of the Tabs root. */
  static hostSelector = '.cck-tabs';

  /**
   * Gets a `HarnessPredicate` that finds Tabs with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckTabsHarnessFilters = {}): HarnessPredicate<CckTabsHarness> {
    return new HarnessPredicate(CckTabsHarness, options).addOption(
      'selected tab label',
      options.selectedTabLabel,
      async (harness, label) => {
        const selected = await harness.getSelectedTab();
        return HarnessPredicate.stringMatches(selected.getLabel(), label);
      },
    );
  }

  /**
   * Gets the tabs.
   *
   * @param filter - The criteria.
   * @returns The matching tabs.
   */
  async getTabs(filter: CckTabHarnessFilters = {}): Promise<CckTabHarness[]> {
    return this.locatorForAll(CckTabHarness.with(filter))();
  }

  /** Gets the selected tab. Fails when no tab is selected. */
  async getSelectedTab(): Promise<CckTabHarness> {
    const selected = (await this.getTabs({ selected: true })).at(0);
    if (!selected) throw new Error('Cannot find a selected tab.');
    return selected;
  }

  /**
   * Selects the first tab that matches.
   *
   * @param filter - The criteria.
   */
  async selectTab(filter: CckTabHarnessFilters = {}): Promise<void> {
    const tab = (await this.getTabs(filter)).at(0);
    if (!tab) throw new Error('Cannot find a tab to select.');
    await tab.select();
  }
}
