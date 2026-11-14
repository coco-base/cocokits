import {
  ContentContainerComponentHarness,
  HarnessPredicate,
  TestKey,
  type BaseHarnessFilters,
  type HarnessLoader,
  type TestElement,
} from '@angular/cdk/testing';

/** Criteria that narrow the Popovers a {@link CckPopoverHarness} finds. */
export interface CckPopoverHarnessFilters extends BaseHarnessFilters {
  /** Only triggers whose text is this string or matches this pattern. */
  triggerText?: string | RegExp;
}

/**
 * Harness for the Trigger of a Popover. The content renders in the overlay container, so the harness reaches it
 * from the document root while the popover is open: `getHarness` and `getAllHarnesses` of this class search the
 * open content.
 */
export class CckPopoverHarness extends ContentContainerComponentHarness {
  /** The selector of the Popover trigger. */
  static hostSelector = '.cck-popover__trigger';

  /**
   * Gets a `HarnessPredicate` that finds Popovers with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckPopoverHarnessFilters = {}): HarnessPredicate<CckPopoverHarness> {
    return new HarnessPredicate(CckPopoverHarness, options).addOption(
      'trigger text',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    );
  }

  /** Whether the trigger is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Whether the popover is open. */
  async isOpen(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }

  /** Opens the popover by clicking the trigger. Does nothing when it is open. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) await (await this.host()).click();
  }

  /** Closes the popover by pressing Escape. Does nothing when it is closed. */
  async close(): Promise<void> {
    if (!(await this.isOpen())) return;
    const content = await this.contentElement();
    await (content ?? (await this.host())).sendKeys(TestKey.ESCAPE);
  }

  /** Gets the text of the trigger. */
  async getTriggerText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the trigger. */
  async focus(): Promise<void> {
    await (await this.host()).focus();
  }

  /** Blurs the trigger. */
  async blur(): Promise<void> {
    await (await this.host()).blur();
  }

  /** Whether the trigger has focus. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Gets the text of the Title of the open content, or `null` while closed or without a Title. */
  async getTitleText(): Promise<string | null> {
    return this.partText('.cck-popover__title');
  }

  /** Gets the text of the Description of the open content, or `null` while closed or without one. */
  async getDescriptionText(): Promise<string | null> {
    return this.partText('.cck-popover__description');
  }

  /** Gets a loader for the open content, found by the `aria-controls` of the trigger. Fails while closed. */
  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const id = await (await this.host()).getAttribute('aria-controls');
    if (!id) throw new Error('Cannot get the content of a closed popover.');
    return this.documentRootLocatorFactory().harnessLoaderFor(this.contentSelector(id));
  }

  private contentSelector(id: string): string {
    return `[id="${id}"]`;
  }

  private async contentElement(): Promise<TestElement | null> {
    const id = await (await this.host()).getAttribute('aria-controls');
    return id ? this.documentRootLocatorFactory().locatorForOptional(this.contentSelector(id))() : null;
  }

  private async partText(selector: string): Promise<string | null> {
    const id = await (await this.host()).getAttribute('aria-controls');
    if (!id) return null;
    const part = await this.documentRootLocatorFactory().locatorForOptional(
      `${this.contentSelector(id)} ${selector}`,
    )();
    return part ? part.text() : null;
  }
}
