import { InjectionToken, type Binding, type Injector, type ViewContainerRef } from '@angular/core';
import type { Direction } from '@cocokits/angular-core';

/**
 * Which element gets the focus when a dialog opens. Any other string is a selector, and the first element that matches it gets the focus.
 * @cckValue 'first-tabbable' - The first element with `autofocus`, or else the first element that Tab reaches, or else the dialog.
 * @cckValue 'dialog' - The dialog itself.
 * @cckValue 'first-heading' - The first heading in the dialog.
 * @cckValue true - The same as `'first-tabbable'`.
 * @cckValue false - The same as `'dialog'`.
 */
export type CckDialogAutoFocus = 'dialog' | 'first-tabbable' | 'first-heading' | (string & {}) | boolean;

/**
 * Where the focus goes when a dialog closes. A string is a selector, and an element gets the focus itself.
 * @cckValue true - The element that had the focus when the dialog opened.
 * @cckValue false - The focus does not move.
 */
export type CckDialogRestoreFocus = boolean | string | HTMLElement;

/**
 * The role of the `<dialog>`.
 * @cckValue 'dialog' - A dialog. The native `<dialog>` has this role already.
 * @cckValue 'alertdialog' - A dialog with an urgent message that needs an answer. It also needs a description.
 */
export type CckDialogRole = 'dialog' | 'alertdialog';

/**
 * The options of one `CckDialog.open` call: the behaviour and the accessibility of the dialog. The look, like the size and the place, belongs to the theme.
 *
 * The values of a new `CckDialogConfig` are the defaults. `CckDialog.open` merges your config over `CCK_DIALOG_DEFAULT_OPTIONS`, or over a new config when that token is not provided.
 *
 * @example
 * this.dialog.open(ConfirmDialog, { data: project, ariaLabel: 'Delete project', autoFocus: 'dialog' });
 * @typeParam D - The type of `data`.
 */
export class CckDialogConfig<D = unknown> {
  /** The place of the opened view in the change detection tree. When not set, the view belongs to the application. */
  viewContainerRef?: ViewContainerRef | undefined;

  /**
   * The parent injector of the opened view. When not set, the injector of `viewContainerRef` is used, or else the injector of the service.
   * @remarks It cannot replace `CckDialogRef`, `CCK_DIALOG_DATA` or the own providers of the dialog.
   */
  injector?: Injector | undefined;

  /** The `id` of the dialog. When not set, the dialog gets a generated id. */
  id?: string | undefined;

  /** The role of the `<dialog>`. Only `'alertdialog'` is written, because a native dialog has the role `dialog` already. */
  role?: CckDialogRole | undefined = 'dialog';

  /**
   * Whether Escape and a press on the backdrop leave the dialog open. The `disableClose` of the ref starts with this value and can change while the dialog is open.
   * @remarks Without Escape, a keyboard user can leave only with the controls inside the dialog. Keep a close button.
   */
  disableClose?: boolean | undefined = false;

  /**
   * A function that decides whether a close happens. Return `false` to keep the dialog open. When not set, every close happens.
   * @remarks It runs once for each close that the user or your code asks for. That is Escape, the backdrop, `[cckDialogClose]`, `<form method="dialog">`, `ref.close()` and `closeAll()`. It never runs for a close on navigation.
   *
   * @param result - The result the close would give.
   * @param config - This config.
   * @param componentInstance - The opened component, `null` for a template.
   */
  closePredicate?: ((result: unknown, config: CckDialogConfig<D>, componentInstance: unknown) => boolean) | undefined;

  /** The data for the opened view. A component reads it with `inject(CCK_DIALOG_DATA)`, and a template gets it as its `$implicit` value. */
  data?: D | null | undefined = null;

  /** The text direction of the content of the dialog. It wins over the direction of the parent injector. When not set, the content takes the direction of the parent injector. */
  direction?: Direction | undefined;

  /** The ids of the elements that describe the dialog. They are added to the id of the `cck-dialog-description`. */
  ariaDescribedBy?: string | null | undefined = null;

  /** The ids of the elements that name the dialog. They are added to the id of the `cckDialogTitle`. With `ariaLabel`, they do nothing. */
  ariaLabelledBy?: string | null | undefined = null;

  /** The accessible name of the dialog. With it, the dialog has no `aria-labelledby`, and the title does not name it. */
  ariaLabel?: string | null | undefined = null;

  /** Whether the dialog gets `aria-modal="true"`. A native modal dialog is modal already. */
  ariaModal?: boolean | undefined = false;

  /**
   * Which element gets the focus when the dialog opens.
   */
  autoFocus?: CckDialogAutoFocus | undefined = 'first-tabbable';

  /**
   * Where the focus goes when the dialog closes. It moves only when the focus is still inside the dialog or on the page body.
   */
  restoreFocus?: CckDialogRestoreFocus | undefined = true;

  /**
   * When the dialog closes because the location changes. A close on navigation skips `disableClose` and `closePredicate`.
   * @cckValue true - The same as `'pop-state'`.
   * @cckValue 'pop-state' - The dialog closes when the user goes back or forward in the history, or the hash changes.
   * @cckValue 'url-change' - The dialog closes on any change of the URL that `Location` reports.
   * @cckValue false - The dialog never closes on navigation.
   */
  closeOnNavigation?: boolean | 'pop-state' | 'url-change' | undefined = true;

  /** The `inputBinding`, `outputBinding` and `twoWayBinding` for the opened component. A template ignores them. When not set, the component gets no bindings. */
  bindings?: Binding[] | undefined;
}

/**
 * The defaults of every `CckDialog.open` call in your app. The config of each call is merged over it.
 *
 * @remarks Your value replaces the built-in defaults. So `{ disableClose: true }` leaves `autoFocus` and `restoreFocus` unset, and the focus does not move. Only `closeOnNavigation` still acts as `true`. To keep the defaults, spread a new config.
 *
 * @example
 * providers: [{ provide: CCK_DIALOG_DEFAULT_OPTIONS, useValue: { ...new CckDialogConfig(), disableClose: true } }]
 */
export const CCK_DIALOG_DEFAULT_OPTIONS = new InjectionToken<CckDialogConfig>('CCK_DIALOG_DEFAULT_OPTIONS');
