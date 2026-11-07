import { ComponentHarness, HarnessPredicate, type BaseHarnessFilters } from '@angular/cdk/testing';

/** Criteria that narrow the Tooltips a {@link CckTooltipHarness} finds. */
export type CckTooltipHarnessFilters = BaseHarnessFilters;

/** How long `show` and `hide` wait for the delay of the tooltip to pass, in milliseconds. */
const SETTLE_LIMIT = 3000;
const SETTLE_STEP = 20;

/**
 * Harness for the Trigger of a Tooltip, in the one-attribute form (`cckTooltip` on the trigger) and in the
 * compound form. The bubble renders in the overlay container, so the harness reads it from the document root.
 */
export class CckTooltipHarness extends ComponentHarness {
  /** The selector of the Tooltip trigger. */
  static hostSelector = '.cck-tooltip__trigger';

  private readonly openBubble = this.documentRootLocatorFactory().locatorForOptional(
    '.cck-tooltip__content[data-state="open"]',
  );

  /**
   * Gets a `HarnessPredicate` that finds Tooltips with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckTooltipHarnessFilters = {}): HarnessPredicate<CckTooltipHarness> {
    return new HarnessPredicate(CckTooltipHarness, options);
  }

  /**
   * Shows the tooltip by hovering the trigger, then waits for its show delay to pass.
   *
   * @throws When the tooltip is still closed after the wait (disabled, or nothing to show).
   */
  async show(): Promise<void> {
    if (await this.isOpen()) return;
    await (await this.host()).hover();
    await this.settle(true);
  }

  /** Hides the tooltip by moving the pointer away, then waits for its hide delay to pass. */
  async hide(): Promise<void> {
    if (!(await this.isOpen())) return;
    await (await this.host()).mouseAway();
    await this.settle(false);
  }

  /** Whether the tooltip is shown. */
  async isOpen(): Promise<boolean> {
    return (await (await this.host()).getAttribute('data-state')) === 'open';
  }

  /** Gets the text of the shown tooltip, or an empty string while it is hidden. */
  async getTooltipText(): Promise<string> {
    return (await (await this.openBubble())?.text()) ?? '';
  }

  private async settle(open: boolean): Promise<void> {
    const deadline = Date.now() + SETTLE_LIMIT;
    while (Date.now() < deadline) {
      await this.forceStabilize();
      if ((await this.isOpen()) === open) return;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, SETTLE_STEP);
      });
    }
    throw new Error(`The tooltip did not ${open ? 'show' : 'hide'}.`);
  }
}
