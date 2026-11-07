import { Location, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  DOCUMENT,
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  createComponent,
  inject,
  signal,
  type ComponentRef,
  type EmbeddedViewRef,
  type Provider,
  type Type,
} from '@angular/core';
import { CckDirection, CckOverlayLayer, IdGenerator, injectZoneBoundary } from '@cocokits/angular-core';
import { Subject, defer, startWith, type Observable } from 'rxjs';
import { CckDialogContainer, startDialogSession, type DialogSession } from './dialog-container';
import { CCK_DIALOG_DEFAULT_OPTIONS, CckDialogConfig } from './dialog-config';
import { deepActiveOrBody } from './dialog-focus';
import { CCK_DIALOG_DATA, CckDialogRef } from './dialog-ref';
import { CckDialogRoot } from './dialog-root';

/**
 * Opens a component or a template in a modal dialog from code. It needs no trigger. It returns a `CckDialogRef`.
 *
 * The dialog works like the `cckDialog` you write in a template. It has the same backdrop, Escape, scroll lock and focus return. The `cckDialogTitle`, `cck-dialog-description` and `cckDialogClose` parts work inside the opened view.
 *
 * The opened component reads the data with `inject(CCK_DIALOG_DATA)` and the ref with `inject(CckDialogRef)`. A template gets the data as its `let-` value and the ref as `let-dialogRef="dialogRef"`.
 *
 * @remarks The dialog shows in the overlay container. That is an open modal dialog that holds the focused element, or else the end of `<body>`. So a dialog opened from a dialog sits inside it.
 *
 * Provide `CckDialog` in the `providers` of a component to close the dialogs of that component when it is destroyed. It shares `openDialogs`, `afterOpened` and `afterAllClosed` with the nearest parent `CckDialog`.
 *
 * On the server, `open()` shows nothing and returns a ref that is already closed.
 *
 * @example
 * ```ts
 * // A component: the data goes in with CCK_DIALOG_DATA, and the result comes out with afterClosed().
 * const ref = inject(CckDialog).open(ConfirmDialog, { data: 'Delete project', ariaLabel: 'Confirm' });
 * ref.afterClosed().subscribe((confirmed) => confirmed && deleteProject());
 *
 * // A template: `let-data` is the data, and `let-ref="dialogRef"` is the ref.
 * dialog.open(this.template(), { data: project });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CckDialog {
  private readonly injector = inject(Injector);
  private readonly environment = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ids = inject(IdGenerator);
  private readonly defaults = inject(CCK_DIALOG_DEFAULT_OPTIONS, { optional: true });
  private readonly parent = inject(CckDialog, { optional: true, skipSelf: true });
  private readonly zone = injectZoneBoundary();
  private readonly openAtThisLevel: CckDialogRef[] = [];
  private readonly dialogs: CckDialogRef[] = [];
  private readonly opened = new Subject<CckDialogRef>();
  private readonly allClosed = new Subject<void>();

  /** The dialogs that are open, in the order they opened. A child `CckDialog` shares this list with its parent. */
  get openDialogs(): readonly CckDialogRef[] {
    return this.openList();
  }

  /** Emits the ref of each dialog at the end of `open()`. A child `CckDialog` shares it with its parent. */
  get afterOpened(): Observable<CckDialogRef> {
    return this.parent ? this.parent.afterOpened : this.opened;
  }

  /** Emits when the last open dialog has closed. A new subscriber gets it at once while no dialog is open. */
  readonly afterAllClosed: Observable<void> = defer(() =>
    this.openList().length > 0 ? this.sharedAllClosed() : this.sharedAllClosed().pipe(startWith(undefined)),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.closeAll([...this.openAtThisLevel]);
      if (!this.parent) {
        this.opened.complete();
        this.allClosed.complete();
      }
    });
  }

  /**
   * Opens a modal dialog with a component or a template.
   *
   * @typeParam T - The type of the opened component.
   * @typeParam D - The type of the data.
   * @typeParam R - The type of the result.
   * @param content - A component, which can inject `CckDialogRef` and `CCK_DIALOG_DATA`. Or a template, which gets `{ $implicit: data, dialogRef }`.
   * @param config - The config of this dialog. It is merged over `CCK_DIALOG_DEFAULT_OPTIONS`.
   * @returns The ref of the dialog.
   * @throws In development, when a dialog with the same `id` is open.
   * @example
   * const ref = this.dialog.open(ConfirmDialog, { data: 'Delete project', ariaLabel: 'Confirm' });
   * ref.afterClosed().subscribe((confirmed) => console.log(confirmed));
   */
  open<T, D = unknown, R = unknown>(
    content: Type<T> | TemplateRef<T>,
    config?: CckDialogConfig<D>,
  ): CckDialogRef<T, R> {
    const merged = this.merge(config);
    const id = merged.id ?? this.ids.getId('cck-dialog');
    if (typeof ngDevMode !== 'undefined' && ngDevMode && this.getDialogById(id)) {
      throw new Error(`CocoKits: a dialog with id "${id}" is already open.`);
    }
    if (!this.browser) {
      const finished = new CckDialogRef<T, R>(id, merged.disableClose, () => undefined, true);
      finished._finish();
      return finished;
    }

    const session = signal<DialogSession<R> | null>(null);
    const ref = new CckDialogRef<T, R>(id, merged.disableClose, (result) => session()?.requestClose(result));
    const { viewContainerRef } = merged;
    const outer = merged.injector ?? viewContainerRef?.injector ?? this.injector;
    const directionProviders: Provider[] = merged.direction
      ? [{ provide: CckDirection, useValue: new CckDirection(signal(merged.direction)) }]
      : [];
    const container = this.createContainer(
      merged,
      merged.direction ? Injector.create({ providers: directionProviders, parent: outer }) : outer,
    );
    const { _root: root } = container.instance;

    // The view's own providers come first: no parent injector can replace them.
    const view = Injector.create({
      providers: [
        { provide: CckDialogRef, useValue: ref },
        { provide: CCK_DIALOG_DATA, useValue: merged.data },
        { provide: CckDialogRoot, useValue: root },
        { provide: CckOverlayLayer, useValue: root._layer },
        ...directionProviders,
      ],
      // A template keeps its declaration chain below the dialog's providers; a component gets the outer injector.
      ...parentOption(content instanceof TemplateRef ? (merged.injector ?? viewContainerRef?.injector) : outer),
    });
    const opened = this.createView(content, ref, merged, view);
    const opener = deepActiveOrBody(this.document);
    session.set(
      startDialogSession<D, T, R>({
        container,
        ref,
        config: merged,
        nodes: opened.nodes,
        opener,
        zone: this.zone,
        destroy: () => {
          opened.destroy();
          container.destroy();
        },
      }),
    );
    const stopNavigation = this.watchNavigation(merged.closeOnNavigation, () => session()?.forceClose());
    this.track(ref as CckDialogRef, stopNavigation);

    // The focused element stands in for the trigger: it gives the container and receives focus back.
    root._trigger.set(opener);
    root.open.set(true);
    this.sharedOpened().next(ref as CckDialogRef);
    return ref;
  }

  /**
   * Closes the open dialogs, the last opened first. A dialog whose `closePredicate` returns `false` stays open.
   *
   * @param dialogs - The dialogs to close. When not set, all open dialogs close.
   * @example
   * this.dialog.closeAll();
   */
  closeAll(dialogs: readonly CckDialogRef[] = this.openList()): void {
    let i = dialogs.length;
    while (i--) dialogs[i]?.close();
  }

  /**
   * Finds an open dialog by its `id`.
   *
   * @param id - The `id` of the dialog.
   * @returns The ref, or `undefined` when no open dialog has this id.
   * @example
   * this.dialog.getDialogById('confirm-delete')?.close(false);
   */
  getDialogById(id: string): CckDialogRef | undefined {
    return this.openList().find((dialog) => dialog.id === id);
  }

  private openList(): CckDialogRef[] {
    return this.parent ? this.parent.openList() : this.dialogs;
  }

  private sharedAllClosed(): Subject<void> {
    return this.parent ? this.parent.sharedAllClosed() : this.allClosed;
  }

  private sharedOpened(): Subject<CckDialogRef> {
    return this.parent ? this.parent.sharedOpened() : this.opened;
  }

  /** The config of the call over the token's value (which replaces the built-in defaults). */
  private merge<D>(config: CckDialogConfig<D> | undefined): CckDialogConfig<D> {
    const merged = Object.assign({}, this.defaults ?? new CckDialogConfig(), config) as CckDialogConfig<D>;
    // A key left out of both acts as `true`; `undefined` acts as `false`.
    if (!Object.hasOwn(merged, 'closeOnNavigation')) merged.closeOnNavigation = true;
    return merged;
  }

  /** Creates the hidden root and `<dialog>`, in the view container when there is one, else attached to the application. */
  private createContainer<D>(config: CckDialogConfig<D>, parent: Injector): ComponentRef<CckDialogContainer> {
    const { viewContainerRef } = config;
    if (viewContainerRef) {
      const container = viewContainerRef.createComponent(CckDialogContainer, { injector: parent });
      // No element stays at the place of the container: the `<dialog>` renders in the overlay container.
      (container.location.nativeElement as HTMLElement).remove();
      return container;
    }
    const container = createComponent(CckDialogContainer, {
      environmentInjector: this.environment,
      elementInjector: parent,
    });
    this.appRef.attachView(container.hostView);
    return container;
  }

  /** Creates the opened component or template; its root nodes move into the `<dialog>` when it is shown. */
  private createView<T, D, R>(
    content: Type<T> | TemplateRef<T>,
    ref: CckDialogRef<T, R>,
    config: CckDialogConfig<D>,
    injector: Injector,
  ): { nodes: Node[]; destroy: () => void } {
    const { viewContainerRef } = config;
    if (content instanceof TemplateRef) {
      const context = { $implicit: config.data, dialogRef: ref } as T;
      const view: EmbeddedViewRef<T> = viewContainerRef
        ? viewContainerRef.createEmbeddedView(content, context, { injector })
        : content.createEmbeddedView(context, injector);
      if (!viewContainerRef) this.appRef.attachView(view);
      const nodes = view.rootNodes as Node[];
      for (const node of nodes) node.parentNode?.removeChild(node);
      return {
        nodes,
        destroy: () => {
          view.destroy();
        },
      };
    }
    const component: ComponentRef<T> = viewContainerRef
      ? viewContainerRef.createComponent(content, {
          injector,
          ...(config.bindings ? { bindings: config.bindings } : {}),
        })
      : createComponent(content, {
          environmentInjector: this.environment,
          elementInjector: injector,
          ...(config.bindings ? { bindings: config.bindings } : {}),
        });
    if (!viewContainerRef) this.appRef.attachView(component.hostView);
    ref._attachComponent(component);
    const host = component.location.nativeElement as HTMLElement;
    host.remove();
    return {
      nodes: [host],
      destroy: () => {
        component.destroy();
      },
    };
  }

  /** Subscribes to the location for `closeOnNavigation`; returns the unsubscribe. */
  private watchNavigation(mode: boolean | 'pop-state' | 'url-change' | undefined, onNavigate: () => void): () => void {
    if (mode !== true && mode !== 'pop-state' && mode !== 'url-change') return () => undefined;
    // Asked for here, in the browser only: `Location` reads the DOM when it is created.
    const location = this.injector.get(Location);
    if (mode === 'url-change') return location.onUrlChange(onNavigate);
    const subscription = location.subscribe(onNavigate);
    return () => {
      subscription.unsubscribe();
    };
  }

  /** Puts the ref in the registry until it finishes. */
  private track(ref: CckDialogRef, stopNavigation: () => void): void {
    this.openList().push(ref);
    this.openAtThisLevel.push(ref);
    // Subscribed before the caller can: the registry is up to date when `afterClosed` handlers run.
    ref.afterClosed().subscribe(() => {
      stopNavigation();
      for (const list of [this.openList(), this.openAtThisLevel]) {
        const index = list.indexOf(ref);
        if (index >= 0) list.splice(index, 1);
      }
      if (this.openList().length === 0) this.sharedAllClosed().next();
    });
  }
}

/** The `parent` option of `Injector.create` when there is a parent; the option cannot be `undefined`. */
function parentOption(parent: Injector | undefined): { parent: Injector } | Record<string, never> {
  return parent ? { parent } : {};
}
