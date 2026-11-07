import { ContentContainerComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';

/** Criteria that narrow the items a {@link CckAccordionItemHarness} finds. */
export interface CckAccordionItemHarnessFilters extends BaseHarnessFilters {
  /** Only items whose label is this string or matches this pattern. */
  label?: string | RegExp;
  /** Only items whose content text is this string or matches this pattern. */
  content?: string | RegExp;
  /** Only items that are expanded, or only those that are not. */
  expanded?: boolean;
  /** Only items that are disabled, or only those that are not. */
  disabled?: boolean;
}

/** Harness for one item of an Accordion. The harnesses you load from it search the content of the item. */
export class CckAccordionItemHarness extends ContentContainerComponentHarness {
  /** The selector of an Accordion item. */
  static hostSelector = '.cck-accordion__item';

  private readonly trigger = this.locatorFor('.cck-accordion__trigger');
  private readonly content = this.locatorForOptional('.cck-accordion__content');

  /**
   * Gets a `HarnessPredicate` that finds items with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckAccordionItemHarnessFilters = {}): HarnessPredicate<CckAccordionItemHarness> {
    return new HarnessPredicate(CckAccordionItemHarness, options)
      .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
      .addOption('content', options.content, (harness, content) =>
        HarnessPredicate.stringMatches(harness.getTextContent(), content),
      )
      .addOption('expanded', options.expanded, async (harness, expanded) => (await harness.isExpanded()) === expanded)
      .addOption('disabled', options.disabled, async (harness, disabled) => (await harness.isDisabled()) === disabled);
  }

  /** Whether the item is expanded. */
  async isExpanded(): Promise<boolean> {
    return (await (await this.trigger()).getAttribute('aria-expanded')) === 'true';
  }

  /** Gets the label of the item: the text of its trigger. */
  async getLabel(): Promise<string> {
    return (await this.trigger()).text();
  }

  /** Whether the item is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-disabled')) !== null;
  }

  /** Toggles the item by clicking its trigger. */
  async toggle(): Promise<void> {
    await (await this.trigger()).click();
  }

  /** Expands the item. Does nothing when it is expanded. */
  async expand(): Promise<void> {
    if (!(await this.isExpanded())) await this.toggle();
  }

  /** Collapses the item. Does nothing when it is collapsed. */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) await this.toggle();
  }

  /** Gets the text of the content, also while it is collapsed and hidden; empty when the content is not mounted. */
  async getTextContent(): Promise<string> {
    return (await (await this.content())?.text()) ?? '';
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
}
