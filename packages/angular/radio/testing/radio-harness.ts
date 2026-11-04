import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';

/** Criteria that narrow the Radios a {@link CckRadioHarness} finds. */
export interface CckRadioHarnessFilters extends BaseHarnessFilters {
  /** Only radios whose label is this string or matches this pattern. */
  label?: string | RegExp;
  /** Only radios with this `name` (a string or a pattern). */
  name?: string | RegExp;
  /** Only radios that are checked, or only those that are not. */
  checked?: boolean;
}

/** Harness for a Radio, standalone or inside a Radio group. */
export class CckRadioHarness extends ComponentHarness {
  /** The selector of the Radio root. */
  static hostSelector = '.cck-radio';

  private readonly input = this.locatorFor('input.cck-radio__input');
  private readonly label = this.locatorFor('.cck-radio__label');

  /**
   * Gets a `HarnessPredicate` that finds radios with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckRadioHarnessFilters = {}): HarnessPredicate<CckRadioHarness> {
    return new HarnessPredicate(CckRadioHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabelText(), label),
      )
      .addOption('name', options.name, (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
      .addOption('checked', options.checked, async (harness, checked) => (await harness.isChecked()) === checked);
  }

  /** Whether the radio is checked. */
  async isChecked(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>('checked');
  }

  /** Whether the radio is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>('disabled');
  }

  /** Whether the radio is required. */
  async isRequired(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>('required');
  }

  /** Gets the `name` of the radio. */
  async getName(): Promise<string | null> {
    return (await this.input()).getAttribute('name');
  }

  /** Gets the `id` of the native input. */
  async getId(): Promise<string | null> {
    return (await this.input()).getAttribute('id');
  }

  /** Gets the submitted value of the radio. */
  async getValue(): Promise<string | null> {
    return (await this.input()).getProperty<string | null>('value');
  }

  /** Gets the text of the label. */
  async getLabelText(): Promise<string> {
    return (await this.label()).text();
  }

  /** Focuses the radio. */
  async focus(): Promise<void> {
    await (await this.input()).focus();
  }

  /** Blurs the radio. */
  async blur(): Promise<void> {
    await (await this.input()).blur();
  }

  /** Whether the radio has focus. */
  async isFocused(): Promise<boolean> {
    return (await this.input()).isFocused();
  }

  /** Checks the radio. Does nothing when it is checked. */
  async check(): Promise<void> {
    if (!(await this.isChecked())) await (await this.input()).click();
  }
}
