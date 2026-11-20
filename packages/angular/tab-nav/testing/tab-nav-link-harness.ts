import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';

/** Criteria that narrow the links a {@link CckTabNavLinkHarness} finds. */
export interface CckTabNavLinkHarnessFilters extends BaseHarnessFilters {
  /** Only links whose label is this string or matches this pattern. */
  label?: string | RegExp;
}

/** Harness for one link of a Tab nav. */
export class CckTabNavLinkHarness extends ComponentHarness {
  /** The selector of a Tab nav link. */
  static hostSelector = '.cck-tab-nav__link';

  /**
   * Gets a `HarnessPredicate` that finds links with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckTabNavLinkHarnessFilters = {}): HarnessPredicate<CckTabNavLinkHarness> {
    return new HarnessPredicate(CckTabNavLinkHarness, options).addOption('label', options.label, (harness, label) =>
      HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  /** Gets the label of the link. */
  async getLabel(): Promise<string> {
    return (await this.host()).text();
  }

  /** Whether the link is the active one. */
  async isActive(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-active')) !== null;
  }

  /** Whether the link is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-disabled')) !== null;
  }

  /** Clicks the link. */
  async click(): Promise<void> {
    await (await this.host()).click();
  }
}
