import { InjectionToken, type ComponentRef } from '@angular/core';
import { ReplaySubject, Subject, type Observable } from 'rxjs';

/**
 * The `data` of the `CckDialog.open` call. The opened component injects it. Its type is `unknown`, so read it as `inject(CCK_DIALOG_DATA) as MyData`.
 * @example
 * readonly project = inject(CCK_DIALOG_DATA) as Project;
 */
export const CCK_DIALOG_DATA = new InjectionToken<unknown>('CCK_DIALOG_DATA');

/**
 * Where a dialog is in its life.
 * @cckValue 'open' - The dialog is open, and no close has begun.
 * @cckValue 'closing' - A close has begun, and the dialog is still in the page.
 * @cckValue 'closed' - The dialog has left the page.
 */
export type CckDialogState = 'open' | 'closing' | 'closed';

/** What the service gives its ref to ask for a close. @internal */
export type CckDialogCloseRequest<R> = (result: R | undefined) => void;

/**
 * The handle of a dialog that `CckDialog.open` opened. The opened component can inject it. Its Observables complete when the dialog closes.
 *
 * @example
 * const ref = this.dialog.open(ConfirmDialog);
 * ref.afterClosed().subscribe((result) => console.log(result));
 *
 * @typeParam T - The type of the opened component.
 * @typeParam R - The type of the result.
 */
export class CckDialogRef<T = unknown, R = unknown> {
  /** The id of the dialog. It is also the `id` of its `<dialog>`. */
  readonly id: string;

  /** The opened component. It is `null` for a template, and after the dialog has closed. */
  componentInstance: T;

  /** The `ComponentRef` of the opened component. It is `null` for a template. */
  componentRef: ComponentRef<T> | null = null;

  /**
   * Whether Escape and a press on the backdrop leave the dialog open. It starts with the value of the config. `close()` still works.
   * @remarks When you change it, the next Escape or press uses the new value.
   */
  disableClose: boolean | undefined;

  private state: CckDialogState = 'open';
  private result: R | undefined;
  private readonly opened = new ReplaySubject<void>(1);
  private readonly beforeClose = new ReplaySubject<R | undefined>(1);
  private readonly closed: Subject<R | undefined>;
  private readonly backdrop = new Subject<MouseEvent>();
  private readonly keydown = new Subject<KeyboardEvent>();
  private readonly request: CckDialogCloseRequest<R>;

  /**
   * @param id - The id of the dialog.
   * @param disableClose - The starting value of `disableClose`.
   * @param request - Asks the dialog to close; it checks the predicate and begins the close.
   * @param replayClosed - Whether `afterClosed()` replays (a ref that is finished when it is returned).
   * @internal
   */
  constructor(id: string, disableClose: boolean | undefined, request: CckDialogCloseRequest<R>, replayClosed = false) {
    this.id = id;
    this.disableClose = disableClose;
    this.componentInstance = null as T;
    this.request = request;
    this.closed = replayClosed ? new ReplaySubject<R | undefined>(1) : new Subject<R | undefined>();
  }

  /**
   * Asks the dialog to close. `closePredicate` runs first and can refuse. It does nothing once a close has begun.
   *
   * @remarks The result is `undefined` for a `cckDialogClose` without a value, Escape, a press on the backdrop, a `<form method="dialog">`, a navigation and `closeAll()`.
   * @param result - The value that `beforeClosed()` and `afterClosed()` emit.
   * @example
   * this.ref.close(true);
   */
  close(result?: R): void {
    if (this.state === 'open') this.request(result);
  }

  /**
   * Emits once after the dialog has opened, the focus has moved and the enter animation has ended. Then it completes. A later subscriber gets it too.
   * @example
   * ref.afterOpened().subscribe(() => console.log('open'));
   */
  afterOpened(): Observable<void> {
    return this.opened.asObservable();
  }

  /**
   * Emits the result once when a close begins, before the exit animation. Then it completes. A later subscriber gets it too.
   * @example
   * ref.beforeClosed().subscribe((result) => console.log('closing with', result));
   */
  beforeClosed(): Observable<R | undefined> {
    return this.beforeClose.asObservable();
  }

  /**
   * Emits the result once after the dialog has left the page and the focus has gone back. Then it completes. So your subscriber can move the focus somewhere else.
   * @remarks A subscriber after the close gets only the completion.
   * @example
   * ref.afterClosed().subscribe((result) => console.log('closed with', result));
   */
  afterClosed(): Observable<R | undefined> {
    return this.closed.asObservable();
  }

  /**
   * Emits each press on the backdrop, also while `disableClose` is `true`. It completes when the dialog closes.
   * @example
   * ref.backdropClick().subscribe(() => console.log('backdrop'));
   */
  backdropClick(): Observable<MouseEvent> {
    return this.backdrop.asObservable();
  }

  /**
   * Emits each `keydown` inside this dialog, Escape too. Keys in a dialog opened above it do not count. It completes when the dialog closes.
   * @example
   * ref.keydownEvents().subscribe((event) => console.log(event.key));
   */
  keydownEvents(): Observable<KeyboardEvent> {
    return this.keydown.asObservable();
  }

  /**
   * Tells where the dialog is in its life: `'open'`, `'closing'` or `'closed'`.
   * @example
   * if (ref.getState() === 'open') ref.close();
   */
  getState(): CckDialogState {
    return this.state;
  }

  /** Sets the opened component, once it is created. @internal */
  _attachComponent(componentRef: ComponentRef<T>): void {
    this.componentRef = componentRef;
    this.componentInstance = componentRef.instance;
  }

  /** Emits a press on the backdrop. @internal */
  _emitBackdropClick(event: MouseEvent): void {
    if (this.state !== 'closed') this.backdrop.next(event);
  }

  /** Emits a keydown from inside the dialog. @internal */
  _emitKeydown(event: KeyboardEvent): void {
    if (this.state !== 'closed') this.keydown.next(event);
  }

  /** The dialog is shown and settled. @internal */
  _markOpened(): void {
    if (this.state !== 'open') return;
    this.opened.next();
    this.opened.complete();
  }

  /**
   * Begins an accepted close. Only the first counts.
   *
   * @param result - The result of the close.
   * @returns Whether this was the first close.
   * @internal
   */
  _begin(result: R | undefined): boolean {
    if (this.state !== 'open') return false;
    this.state = 'closing';
    this.result = result;
    this.beforeClose.next(result);
    this.beforeClose.complete();
    return true;
  }

  /** The dialog has left the document and focus went back: settle every stream. @internal */
  _finish(): void {
    if (this.state === 'closed') return;
    this._begin(undefined);
    this.state = 'closed';
    this.componentInstance = null as T;
    this.opened.complete();
    this.closed.next(this.result);
    this.closed.complete();
    this.backdrop.complete();
    this.keydown.complete();
  }
}
