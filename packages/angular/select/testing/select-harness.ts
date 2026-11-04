import { ComponentHarness, HarnessPredicate, TestKey, type BaseHarnessFilters } from '@angular/cdk/testing';
import { CckSelectOptionGroupHarness, type CckSelectOptionGroupHarnessFilters } from './select-option-group-harness';
import { CckSelectOptionHarness, type CckSelectOptionHarnessFilters } from './select-option-harness';

/** Criteria that narrow the Selects a {@link CckSelectHarness} finds. */
export interface CckSelectHarnessFilters extends BaseHarnessFilters {
  /** Only Selects that are disabled, or only those that are not. */
  disabled?: boolean;
}

/**
 * Harness for a Select. The list renders in the overlay container, so the options and groups are found from the
 * document root and only while the Select is open.
 */
export class CckSelectHarness extends ComponentHarness {
  /** The selector of the Select root. */
  static hostSelector = '.cck-select';

  private readonly trigger = this.locatorFor('.cck-select__trigger');
  private readonly value = this.locatorForOptional('.cck-select__value');
  private readonly placeholder = this.locatorForOptional('.cck-select__placeholder');

  /**
   * Gets a `HarnessPredicate` that finds Selects with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckSelectHarnessFilters = {}): HarnessPredicate<CckSelectHarness> {
    return new HarnessPredicate(CckSelectHarness, options).addOption(
      'disabled',
      options.disabled,
      async (harness, disabled) => (await harness.isDisabled()) === disabled,
    );
  }

  /** Whether the Select is disabled. */
  async isDisabled(): Promise<boolean> {
    return this.hasAttribute('data-disabled');
  }

  /** Whether a value is required. */
  async isRequired(): Promise<boolean> {
    return this.hasAttribute('data-required');
  }

  /** Whether the Select is valid: it is not marked invalid. */
  async isValid(): Promise<boolean> {
    return !(await this.hasAttribute('data-invalid'));
  }

  /** Whether nothing is selected. */
  async isEmpty(): Promise<boolean> {
    return this.hasAttribute('data-placeholder-shown');
  }

  /** Whether the Select takes several values. */
  async isMultiple(): Promise<boolean> {
    return this.hasAttribute('data-multiple');
  }

  /** Gets the text of the value, or the placeholder while nothing is selected. */
  async getValueText(): Promise<string> {
    const part = (await this.value()) ?? (await this.placeholder());
    return part ? part.text() : '';
  }

  /** Focuses the trigger. */
  async focus(): Promise<void> {
    await (await this.trigger()).focus();
  }

  /** Blurs the trigger. */
  async blur(): Promise<void> {
    await (await this.trigger()).blur();
  }

  /** Whether the trigger has focus. */
  async isFocused(): Promise<boolean> {
    return (await this.trigger()).isFocused();
  }

  /** Whether the list is open. */
  async isOpen(): Promise<boolean> {
    return (await (await this.trigger()).getAttribute('aria-expanded')) === 'true';
  }

  /** Opens the list by clicking the trigger. Does nothing when it is open. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) await (await this.trigger()).click();
  }

  /** Closes the list by pressing Escape on the trigger. Does nothing when it is closed. */
  async close(): Promise<void> {
    if (await this.isOpen()) await (await this.trigger()).sendKeys(TestKey.ESCAPE);
  }

  /**
   * Gets the options of the open list; none while it is closed.
   *
   * @param filter - The criteria.
   * @returns The matching options.
   */
  async getOptions(filter: CckSelectOptionHarnessFilters = {}): Promise<CckSelectOptionHarness[]> {
    const id = await this.contentId();
    if (!id) return [];
    return this.documentRootLocatorFactory().locatorForAll(
      CckSelectOptionHarness.with({ ...filter, ancestor: this.listSelector(id) }),
    )();
  }

  /**
   * Gets the option groups of the open list; none while it is closed.
   *
   * @param filter - The criteria.
   * @returns The matching groups.
   */
  async getOptionGroups(filter: CckSelectOptionGroupHarnessFilters = {}): Promise<CckSelectOptionGroupHarness[]> {
    const id = await this.contentId();
    if (!id) return [];
    return this.documentRootLocatorFactory().locatorForAll(
      CckSelectOptionGroupHarness.with({ ...filter, ancestor: this.listSelector(id) }),
    )();
  }

  /**
   * Opens the list and clicks the options that match, in order.
   *
   * @param filter - The criteria.
   */
  async clickOptions(filter: CckSelectOptionHarnessFilters = {}): Promise<void> {
    await this.open();
    const options = await this.getOptions(filter);
    if (options.length === 0) throw new Error('Cannot click: no option matches the filter.');
    for (const option of options) await option.click();
  }

  private async hasAttribute(name: string): Promise<boolean> {
    return (await (await this.host()).getAttribute(name)) !== null;
  }

  private async contentId(): Promise<string | null> {
    return (await this.trigger()).getAttribute('aria-controls');
  }

  private listSelector(id: string): string {
    return `[id="${id}"]`;
  }
}
