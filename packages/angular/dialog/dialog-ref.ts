import { InjectionToken, type ComponentRef } from '@angular/core';
import { ReplaySubject, Subject, type Observable } from 'rxjs';

/**
 * The data given to `CckDialog.open`, injectable in the opened component. It is typed `unknown`; read it as
 * `inject(CCK_DIALOG_DATA) as MyData`.
 */
export const CCK_DIALOG_DATA = new InjectionToken<unknown>('CCK_DIALOG_DATA');

/** Where a dialog is in its life: `'open'` until a close begins, `'closing'` until it has left the document, then `'closed'`. */
export type CckDialogState = 'open' | 'closing' | 'closed';

/** What the service gives its ref to ask for a close. @internal */
export type CckDialogCloseRequest<R> = (result: R | undefined) => void;

/**
 * The handle of a dialog opened by `CckDialog.open`; injectable in the
 * opened component. The notification Observables complete when the dialog closes.
 *
 * @typeParam T - The type of the opened component.
 * @typeParam R - The type of the result.
 */
export class CckDialogRef<T = unknown, R = unknown> {
  /** The id of the dialog, also the `id` of its `<dialog>`. */
  readonly id: string;

  /** The opened component; `null` for a template, and after the dialog has closed. */
  componentInstance: T;

  /** The reference of the opened component; `null` for a template. */
  componentRef: ComponentRef<T> | null = null;

  /**
   * Whether Escape and a press on the backdrop leave the dialog open. Starts from the config; change it while the
   * dialog is open and the next Escape or press reads the new value. `close()` still works.
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
   * Asks the dialog to close. `closePredicate` runs first and may refuse. Ignored once a close has begun.
   *
   * @param result - What `beforeClosed()` and `afterClosed()` emit.
   */
  close(result?: R): void {
    if (this.state === 'open') this.request(result);
  }

  /** Emits once, after the dialog has opened, focus is placed and its CSS enter animations have finished; then completes. A later subscriber gets it too. */
  afterOpened(): Observable<void> {
    return this.opened.asObservable();
  }

  /** Emits the result once when a close begins (before the exit animation); then completes. A later subscriber gets it too. */
  beforeClosed(): Observable<R | undefined> {
    return this.beforeClose.asObservable();
  }

  /**
   * Emits the result once, after the dialog has left the document and focus has gone back, so a subscriber
   * can move focus elsewhere; then completes. A subscriber after the close gets only the completion.
   */
  afterClosed(): Observable<R | undefined> {
    return this.closed.asObservable();
  }

  /** Emits each press on the backdrop, also while `disableClose` is `true`; completes when the dialog closes. */
  backdropClick(): Observable<MouseEvent> {
    return this.backdrop.asObservable();
  }

  /** Emits each keydown inside this dialog (not inside a dialog opened above it), Escape included; completes when the dialog closes. */
  keydownEvents(): Observable<KeyboardEvent> {
    return this.keydown.asObservable();
  }

  /** Where the dialog is in its life. */
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
