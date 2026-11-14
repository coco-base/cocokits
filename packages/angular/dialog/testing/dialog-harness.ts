import {
  ContentContainerComponentHarness,
  HarnessPredicate,
  TestKey,
  type BaseHarnessFilters,
} from '@angular/cdk/testing';

/** The `role` of a dialog: the native `dialog` element's own role is `dialog`. */
export type CckDialogHarnessRole = 'dialog' | 'alertdialog';

/** Criteria that narrow the Dialogs a {@link CckDialogHarness} finds. */
export type CckDialogHarnessFilters = BaseHarnessFilters;

/**
 * Harness for the open content of a Dialog, declarative (`cckDialogContent`) or opened by the dialog service.
 * The content renders in the overlay container, so find it from the document root:
 * `TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(CckDialogHarness)`.
 */
export class CckDialogHarness extends ContentContainerComponentHarness {
  /** The selector of the Dialog content. */
  static hostSelector = '.cck-dialog__content';

  private readonly title = this.locatorForOptional('.cck-dialog__title');
  private readonly description = this.locatorForOptional('.cck-dialog__description');

  /**
   * Gets a `HarnessPredicate` that finds Dialogs with the given criteria.
   *
   * @param options - The criteria.
   * @returns The predicate.
   */
  static with(options: CckDialogHarnessFilters = {}): HarnessPredicate<CckDialogHarness> {
    return new HarnessPredicate(CckDialogHarness, options);
  }

  /** Gets the id of the dialog. */
  async getId(): Promise<string | null> {
    return (await this.host()).getAttribute('id');
  }

  /** Gets the role of the dialog: `alertdialog` when set, else `dialog`. */
  async getRole(): Promise<CckDialogHarnessRole> {
    return (await (await this.host()).getAttribute('role')) === 'alertdialog' ? 'alertdialog' : 'dialog';
  }

  /** Gets the `aria-label` of the dialog. */
  async getAriaLabel(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the `aria-labelledby` of the dialog. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /** Gets the `aria-describedby` of the dialog. */
  async getAriaDescribedby(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-describedby');
  }

  /** Closes the dialog by pressing Escape. */
  async close(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.ESCAPE);
  }

  /** Gets the text of the whole dialog. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the text of the Title, or `null` when the dialog has none. */
  async getTitleText(): Promise<string | null> {
    return (await this.title())?.text() ?? null;
  }

  /** Gets the text of the Description, or `null` when the dialog has none. */
  async getDescriptionText(): Promise<string | null> {
    return (await this.description())?.text() ?? null;
  }
}
