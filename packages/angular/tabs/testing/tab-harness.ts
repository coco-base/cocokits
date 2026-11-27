import {
  ContentContainerComponentHarness,
  HarnessPredicate,
  type BaseHarnessFilters,
  type HarnessLoader,
} from '@angular/cdk/testing';

/** Criteria that narrow the tabs a {@link CckTabHarness} finds. */
export interface CckTabHarnessFilters extends BaseHarnessFilters {
  /** Only tabs whose label is this string or matches this pattern. */
  label?: string | RegExp;
  /** Only tabs that are selected, or only those that are not. */
  selected?: boolean;
}

/**
 * Harness for one tab, hosted on its trigger. The harnesses you load from it search the panel of the tab, which
 * holds content only while the tab is selected (or when the Tabs preserve their content).
 */
export class CckTabHarness extends ContentContainerComponentHarness {
  /** The selector of a tab trigger. */
  static hostSelector = '.cck-tabs__trigger';

  /**
   * Gets a `HarnessPredicate` that finds tabs with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckTabHarnessFilters = {}): HarnessPredicate<CckTabHarness> {
    return new HarnessPredicate(CckTabHarness, options)
      .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
      .addOption('selected', options.selected, async (harness, selected) => (await harness.isSelected()) === selected);
  }

  /** Gets the label of the tab. */
  async getLabel(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the `aria-label` of the tab. */
  async getAriaLabel(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the `aria-labelledby` of the tab. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /** Whether the tab is selected. */
  async isSelected(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }

  /** Whether the tab is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-disabled')) !== null;
  }

  /** Selects the tab by clicking its trigger. */
  async select(): Promise<void> {
    await (await this.host()).click();
  }

  /** Gets the text of the panel of the tab; empty while the panel holds no content. */
  async getTextContent(): Promise<string> {
    const panel = await this.documentRootLocatorFactory().locatorFor(await this.panelSelector())();
    return panel.text();
  }

  /** Gets a loader for the panel of the tab. */
  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    return this.documentRootLocatorFactory().harnessLoaderFor(await this.panelSelector());
  }

  private async panelSelector(): Promise<string> {
    const id = await (await this.host()).getAttribute('aria-controls');
    if (!id) throw new Error('The tab has no panel.');
    return `[id="${id}"]`;
  }
}
