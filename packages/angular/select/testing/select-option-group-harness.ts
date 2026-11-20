import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';
import { CckSelectOptionHarness, type CckSelectOptionHarnessFilters } from './select-option-harness';

/** Criteria that narrow the option groups a {@link CckSelectOptionGroupHarness} finds. */
export interface CckSelectOptionGroupHarnessFilters extends BaseHarnessFilters {
  /** Only groups whose label is this string or matches this pattern. */
  labelText?: string | RegExp;
}

/** Harness for one option group of an open Select. */
export class CckSelectOptionGroupHarness extends ComponentHarness {
  /** The selector of a Select option group. */
  static hostSelector = '.cck-select__option-group';

  private readonly label = this.locatorFor('.cck-select__option-group-label');

  /**
   * Gets a `HarnessPredicate` that finds option groups with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckSelectOptionGroupHarnessFilters = {}): HarnessPredicate<CckSelectOptionGroupHarness> {
    return new HarnessPredicate(CckSelectOptionGroupHarness, options).addOption(
      'labelText',
      options.labelText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getLabelText(), text),
    );
  }

  /** Gets the text of the group label. */
  async getLabelText(): Promise<string> {
    return (await this.label()).text();
  }

  /** Whether the group is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-disabled')) !== null;
  }

  /**
   * Gets the options of the group.
   *
   * @param filter - The criteria.
   * @returns The matching options.
   */
  async getOptions(filter: CckSelectOptionHarnessFilters = {}): Promise<CckSelectOptionHarness[]> {
    return this.locatorForAll(CckSelectOptionHarness.with(filter))();
  }
}
