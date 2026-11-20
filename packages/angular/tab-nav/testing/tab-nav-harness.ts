import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';
import { CckTabNavLinkHarness, type CckTabNavLinkHarnessFilters } from './tab-nav-link-harness';
import { CckTabNavPanelHarness } from './tab-nav-panel-harness';

/** Criteria that narrow the Tab navs a {@link CckTabNavHarness} finds. */
export type CckTabNavHarnessFilters = BaseHarnessFilters;

/** Harness for a Tab nav. */
export class CckTabNavHarness extends ComponentHarness {
  /** The selector of the Tab nav root. */
  static hostSelector = '.cck-tab-nav';

  /**
   * Gets a `HarnessPredicate` that finds Tab navs with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckTabNavHarnessFilters = {}): HarnessPredicate<CckTabNavHarness> {
    return new HarnessPredicate(CckTabNavHarness, options);
  }

  /**
   * Gets the links.
   *
   * @param filter - The criteria.
   * @returns The matching links.
   */
  async getLinks(filter: CckTabNavLinkHarnessFilters = {}): Promise<CckTabNavLinkHarness[]> {
    return this.locatorForAll(CckTabNavLinkHarness.with(filter))();
  }

  /** Gets the active link, or `null` when no link is active. */
  async getActiveLink(): Promise<CckTabNavLinkHarness | null> {
    for (const link of await this.getLinks()) {
      if (await link.isActive()) return link;
    }
    return null;
  }

  /**
   * Clicks the first link that matches.
   *
   * @param filter - The criteria.
   */
  async clickLink(filter: CckTabNavLinkHarnessFilters = {}): Promise<void> {
    const link = (await this.getLinks(filter)).at(0);
    if (!link) throw new Error('Cannot find a link to click.');
    await link.click();
  }

  /** Gets the panel the nav controls. Fails when no link points at a panel. */
  async getPanel(): Promise<CckTabNavPanelHarness> {
    for (const link of await this.locatorForAll('.cck-tab-nav__link')()) {
      const id = await link.getAttribute('aria-controls');
      if (id)
        return this.documentRootLocatorFactory().locatorFor(CckTabNavPanelHarness.with({ selector: `[id="${id}"]` }))();
    }
    throw new Error('The nav controls no panel: link a panel with `tabPanel`.');
  }
}
