import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';
import { CckRadioHarness, type CckRadioHarnessFilters } from '@cocokits/angular/radio/testing';

/** Criteria that narrow the Radio groups a {@link CckRadioGroupHarness} finds. */
export interface CckRadioGroupHarnessFilters extends BaseHarnessFilters {
  /** Only groups whose radios have this `name` (a string or a pattern). */
  name?: string | RegExp;
}

/** Harness for a Radio group. */
export class CckRadioGroupHarness extends ComponentHarness {
  /** The selector of the Radio group root. */
  static hostSelector = '.cck-radio-group';

  /**
   * Gets a `HarnessPredicate` that finds Radio groups with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckRadioGroupHarnessFilters = {}): HarnessPredicate<CckRadioGroupHarness> {
    return new HarnessPredicate(CckRadioGroupHarness, options).addOption('name', options.name, (harness, name) =>
      HarnessPredicate.stringMatches(harness.getName(), name),
    );
  }

  /** Gets the `name` the group gives its radios, or `null` when it has no radio. */
  async getName(): Promise<string | null> {
    const first = (await this.getRadios()).at(0);
    return first ? first.getName() : null;
  }

  /** Gets the `id` of the group. */
  async getId(): Promise<string | null> {
    return (await this.host()).getAttribute('id');
  }

  /** Gets the checked radio, or `null` when none is checked. */
  async getCheckedRadio(): Promise<CckRadioHarness | null> {
    return (await this.getRadios({ checked: true })).at(0) ?? null;
  }

  /** Gets the value of the checked radio, or `null` when none is checked. */
  async getCheckedValue(): Promise<string | null> {
    const checked = await this.getCheckedRadio();
    return checked ? checked.getValue() : null;
  }

  /**
   * Gets the radios of the group.
   *
   * @param filter - The criteria.
   * @returns The matching radios.
   */
  async getRadios(filter: CckRadioHarnessFilters = {}): Promise<CckRadioHarness[]> {
    return this.locatorForAll(CckRadioHarness.with(filter))();
  }

  /**
   * Checks the first radio that matches.
   *
   * @param filter - The criteria.
   */
  async checkRadio(filter: CckRadioHarnessFilters = {}): Promise<void> {
    const radio = (await this.getRadios(filter)).at(0);
    if (!radio) throw new Error('Cannot find a radio to check.');
    await radio.check();
  }
}
