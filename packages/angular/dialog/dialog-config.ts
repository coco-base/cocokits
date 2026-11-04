import { InjectionToken, type Binding, type Injector, type ViewContainerRef } from '@angular/core';
import type { Direction } from '@cocokits/angular-core';

/** Which element takes focus when a dialog opens. `'first-tabbable'` and `true` are the same, `'dialog'` and `false` too. */
export type CckDialogAutoFocus = 'dialog' | 'first-tabbable' | 'first-heading' | (string & {}) | boolean;

/** Where focus goes when a dialog closes: `true` the element that had focus at the call, a selector or an element, `false` nowhere. */
export type CckDialogRestoreFocus = boolean | string | HTMLElement;

/** The role of the `<dialog>`. */
export type CckDialogRole = 'dialog' | 'alertdialog';

/**
 * The behaviour and accessibility members of `CckDialog.open`, as Angular Material's `MatDialogConfig` has them.
 * The visual members (`panelClass`, `width`, `position`, animation durations and the like) are the theme's.
 * The field initializers are the defaults; `CckDialog.open` spreads the config of the call over the value of
 * `CCK_DIALOG_DEFAULT_OPTIONS`, or over a new `CckDialogConfig` when that token is not provided.
 *
 * @typeParam D - The type of `data`.
 */
export class CckDialogConfig<D = unknown> {
  /** Where the opened view lives in the change-detection tree. Without it the view is attached to the application. */
  viewContainerRef?: ViewContainerRef | undefined;

  /** The parent injector of the opened view; it cannot replace `CckDialogRef`, `CCK_DIALOG_DATA` or the dialog's own providers. */
  injector?: Injector | undefined;

  /** The id of the dialog. @defaultValue generated */
  id?: string | undefined;

  /** The role of the `<dialog>`. Only `'alertdialog'` is written: a native dialog already has the role `dialog`. */
  role?: CckDialogRole | undefined = 'dialog';

  /**
   * Whether Escape and a press on the backdrop leave the dialog open. The ref's `disableClose` starts from this
   * and can change while the dialog is open. Blocking Escape breaks the expected dialog pattern (a keyboard user
   * then has only the controls inside the dialog to leave it): keep a Close button.
   */
  disableClose?: boolean | undefined = false;

  /**
   * Decides whether a close happens; `false` keeps the dialog open. It runs once for every close the user or the
   * code asks for (Escape, the backdrop, `[cckDialogClose]`, `<form method="dialog">`, `ref.close()`, `closeAll()`)
   * and never for a close on navigation. Refusing weakens the dialog pattern (see `disableClose`).
   *
   * @param result - The result the close would give.
   * @param config - This config.
   * @param componentInstance - The opened component, `null` for a template.
   */
  closePredicate?: ((result: unknown, config: CckDialogConfig<D>, componentInstance: unknown) => boolean) | undefined;

  /** Injectable in the opened component as `CCK_DIALOG_DATA`; the `$implicit` value of a template. */
  data?: D | null | undefined = null;

  /** The direction of the dialog's content. Always wins over the direction of the parent injector. */
  direction?: Direction | undefined;

  /** The ids of the elements that describe the dialog. Merged with the Description's id, never replacing it. */
  ariaDescribedBy?: string | null | undefined = null;

  /** The ids of the elements that name the dialog. Merged with the Title's id; ignored when `ariaLabel` is set. */
  ariaLabelledBy?: string | null | undefined = null;

  /** The name of the dialog. When set the dialog has no `aria-labelledby`. */
  ariaLabel?: string | null | undefined = null;

  /** Written as `aria-modal="true"` when `true`; `showModal()` already makes the dialog modal. */
  ariaModal?: boolean | undefined = false;

  /**
   * Which element takes focus when the dialog opens. `'first-tabbable'` (or `true`): the first `[autofocus]`
   * element, else the first tabbable one, else the dialog. `'dialog'` (or `false`): the dialog itself.
   * `'first-heading'`: the first heading. Any other string: the first element that matches the selector.
   */
  autoFocus?: CckDialogAutoFocus | undefined = 'first-tabbable';

  /**
   * Where focus goes when the dialog closes (only if focus is still inside the dialog or on the body):
   * `true` the element that had focus when `open` was called, a selector or an element, `false` nowhere.
   */
  restoreFocus?: CckDialogRestoreFocus | undefined = true;

  /**
   * Closes the dialog when the location changes: `true` or `'pop-state'` on a history traversal or hash change,
   * `'url-change'` on any URL change Angular's `Location` reports, `false` never. A close on navigation skips
   * `disableClose` and `closePredicate`.
   */
  closeOnNavigation?: boolean | 'pop-state' | 'url-change' | undefined = true;

  /** Inputs, outputs and two-way bindings applied to the opened component when it is created. Ignored for a template. */
  bindings?: Binding[] | undefined;
}

/**
 * The defaults of every `CckDialog.open` call. The value **replaces** the built-in defaults, as Material's does:
 * `{ disableClose: true }` leaves `autoFocus`, `restoreFocus` and the other members `undefined` (no focus move, no
 * focus restore), except `closeOnNavigation`, which acts as `true` when the key is left out. Spread a new config
 * to keep the defaults: `{ ...new CckDialogConfig(), disableClose: true }`. The config of the call is merged on top.
 */
export const CCK_DIALOG_DEFAULT_OPTIONS = new InjectionToken<CckDialogConfig>('CCK_DIALOG_DEFAULT_OPTIONS');
