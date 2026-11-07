import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';

/** Criteria that narrow the options a {@link CckSelectOptionHarness} finds. */
export interface CckSelectOptionHarnessFilters extends BaseHarnessFilters {
  /** Only options whose text is this string or matches this pattern. */
  text?: string | RegExp;
  /** Only options that are selected, or only those that are not. */
  isSelected?: boolean;
}

/** Harness for one option of an open Select. */
export class CckSelectOptionHarness extends ComponentHarness {
  /** The selector of a Select option. */
  static hostSelector = '.cck-select__option';

  /**
   * Gets a `HarnessPredicate` that finds options with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckSelectOptionHarnessFilters = {}): HarnessPredicate<CckSelectOptionHarness> {
    return new HarnessPredicate(CckSelectOptionHarness, options)
      .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
      .addOption(
        'isSelected',
        options.isSelected,
        async (harness, isSelected) => (await harness.isSelected()) === isSelected,
      );
  }

  /** Clicks the option. */
  async click(): Promise<void> {
    await (await this.host()).click();
  }

  /** Gets the text of the option. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Whether the option is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-disabled')) !== null;
  }

  /** Whether the option is selected. */
  async isSelected(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-selected')) === 'true';
  }

  /** Whether the option is the highlighted one (the active descendant of the list). */
  async isActive(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-highlighted')) !== null;
  }

  /** Whether the option belongs to a multiple Select. */
  async isMultiple(): Promise<boolean> {
    return (await this.host()).matchesSelector('[aria-multiselectable="true"] *');
  }
}
