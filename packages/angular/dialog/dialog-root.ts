import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  DestroyRef,
  Directive,
  Injector,
  PLATFORM_ID,
  Renderer2,
  afterRenderEffect,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
  untracked,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { CckOverlayLayer, CckPortal, IdGenerator, injectZoneBoundary, themeAttrs } from '@cocokits/angular-core';
import { createDismissLayer, type DismissIntent, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, scheduleFocus, type FocusReturn } from '@cocokits/cdk/focus';
import { createPresence } from '@cocokits/cdk/presence';
import { lockScroll } from '@cocokits/cdk/scroll-lock';
import {
  dialogAnatomy,
  getDialogProps,
  transitionDialog,
  type DialogChangeReason,
  type DialogEvent,
  type DialogParts,
  type DialogState,
} from '@cocokits/machines/dialog';
import { containsDeep } from '@cocokits/utils';
import { applyAutoFocus, deepActiveOrBody, restoreTarget } from './dialog-focus';
import { CckDialogOptions } from './dialog-options';
import { watchNavigation } from './dialog-navigation';
import type { DialogChangeDetails } from './dialog-types';

export type { DialogChangeDetails, DialogOpenChangeReason } from './dialog-types';

/**
 * What the dialog service plugs into the root of the dialog it renders. A declarative Dialog has none.
 *
 * @internal
 */
export interface DialogRootHooks {
  /** Called with a press on the backdrop, before the close decision. */
  backdropPress(event: Event): void;
  /** Called right before `showModal()`: the opened view moves into the dialog. */
  beforeShow(dialog: HTMLDialogElement): void;
  /** Called right after the dialog is shown: place focus. */
  shown(dialog: HTMLDialogElement): void;
  /** Called once the closed dialog has left the document and focus went back (or did not). */
  returned(): void;
  /** Where focus goes back to: `'opener'`, a function that resolves the target at close, or `null` for nowhere. */
  readonly returnTo: 'opener' | (() => HTMLElement | null) | null;
}

/** What the service writes onto the `<dialog>` besides the machine's attributes. @internal */
export interface DialogServiceAttrs {
  readonly id?: string | undefined;
  readonly label?: string | null | undefined;
  readonly labelledBy?: readonly string[] | null | undefined;
  readonly describedBy?: readonly string[] | null | undefined;
  /** Whether the `<dialog>` gets `aria-modal="true"`. */
  readonly ariaModal?: boolean | undefined;
}

/**
 * A window over the page. Put the root on an `ng-container`; it makes no element. It holds the open state and links the trigger, the content, the title, the description and the close button.
 *
 * You write the content as a native `<dialog>` in a `cckDialogPortal` template. It shows in the overlay container. It is modal unless you set `[modal]="false"`: `modal` adds the backdrop, makes the rest of the page inert and stops the page from scrolling. A dialog that is not modal has no backdrop, and the page stays usable. It closes on Escape, on a press outside and when the focus moves outside it, and its trigger opens and closes it.
 *
 * The dialog closes on the close button, Escape, a press on the backdrop and the submit of a `<form method="dialog">` inside it. Then the focus goes back to the element that had it, which is usually the trigger. It also closes when the user goes back or forward in the history, unless you set `[closeOnNavigation]="false"`.
 *
 * Build the content from `cck-dialog-header`, `cck-dialog-body` and `cck-dialog-footer`. Set the size with `width`, `height`, `minWidth`, `minHeight`, `maxWidth` and `maxHeight`; they are the one inline style a part writes.
 *
 * @remarks The focus starts on an element with `autofocus`, or else on the first focusable element. The browser decides what Tab reaches after the last control. Escape closes only the top dialog.
 *
 * The trigger is optional. A dialog without one opens from `open`, and shows next to the element that had the focus.
 *
 * To open a dialog from code, use the `CckDialog` service.
 *
 * @example
 * <ng-container cckDialog [(open)]="deleting">
 *   <button cckDialogTrigger type="button">Delete project</button>
 *   <ng-template cckDialogPortal>
 *     <dialog cckDialogContent>
 *       <cck-dialog-header><h2 cckDialogTitle>Delete project</h2></cck-dialog-header>
 *       <cck-dialog-body><cck-dialog-description>This cannot be undone.</cck-dialog-description></cck-dialog-body>
 *       <cck-dialog-footer><button cckDialogClose type="button">Cancel</button></cck-dialog-footer>
 *     </dialog>
 *   </ng-template>
 * </ng-container>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The trigger and the `cckDialogPortal` template. When not set, there is nothing to open.
 */
@Directive({
  selector: '[cckDialog]',
  exportAs: 'cckDialog',
  providers: [CckPortal, CckOverlayLayer],
})
export class CckDialogRoot extends CckDialogOptions {
  /**
   * Whether the dialog is open. Use `[(open)]` to read and change it.
   * @remarks `openChange` emits the new value when the dialog opens or closes itself. `opened` and `closed` also send the reason.
   * @defaultValue false
   */
  readonly open = model(false);

  /**
   * Emits after the user opens the dialog with the trigger. It sends the `reason` and the `event`.
   * @remarks It never emits when the parent changes `open`.
   * @example
   * <ng-container cckDialog (opened)="onOpen($event)">
   *   <button cckDialogTrigger type="button">Edit</button>
   *   <ng-template cckDialogPortal>
   *     <dialog cckDialogContent aria-label="Edit">…</dialog>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: onOpen(details: DialogChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly opened = output<DialogChangeDetails>();

  /**
   * Emits after the dialog closes itself. It sends the `reason` and the `event`.
   * @remarks The close button, a `<form method="dialog">`, Escape and a press on the backdrop close it. It never emits when the parent changes `open`.
   * @example
   * <ng-container cckDialog (closed)="onClose($event)">
   *   <button cckDialogTrigger type="button">Edit</button>
   *   <ng-template cckDialogPortal>
   *     <dialog cckDialogContent aria-label="Edit">…</dialog>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: onClose(details: DialogChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closed = output<DialogChangeDetails>();

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(dialogAnatomy);

  /** @internal */
  readonly _trigger = signal<HTMLElement | null>(null);
  /** The element that had focus when a dialog without a trigger opened (the body when nothing had): the anchor of the portal. */
  private readonly opener = signal<HTMLElement | null>(null);
  /** What the portal anchors to: the trigger, else the opener. */
  private readonly anchor = computed(() => this._trigger() ?? this.opener());
  /** @internal */
  readonly _content = signal<HTMLDialogElement | null>(null);
  /** @internal */
  readonly _template = signal<TemplateRef<void> | null>(null);
  /** The `id` input of each mounted Title; the content is labelled by the first while there is one. @internal */
  readonly _titles = signal<readonly Signal<string | undefined>[]>([]);
  /** Set by the dialog service; a declarative Dialog has none. @internal */
  _hooks: DialogRootHooks | null = null;
  /** The attributes the service adds to the `<dialog>`; `null` for a declarative Dialog. @internal */
  readonly _serviceAttrs = signal<DialogServiceAttrs | null>(null);
  /** How many Descriptions are mounted. @internal */
  readonly _descriptions = signal(0);

  /** Whether the content is in the document: open, or closed with an exit animation still running. @internal */
  readonly _mounted = signal(false);
  /** The value of the `cckDialogClose` that closed the dialog, read by the dialog service while the change is emitted. @internal */
  _closeValue: unknown = undefined;
  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly renderer = inject(Renderer2);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Whether the open dialog is modal: the `modal` input as it was when the dialog opened. @internal */
  readonly _modalNow = signal(true);
  private readonly id = inject(IdGenerator).getId(dialogAnatomy.classes.root);
  private readonly portal = inject(CckPortal);
  /** @internal */
  readonly _layer = inject(CckOverlayLayer);
  private readonly zone = injectZoneBoundary();
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
  private dismissLayer: DismissLayer | null = null;
  /** The layer has exited: it raises no intent, but stays a barrier until the modal has left the document. */
  private dismissExited = false;
  /** The scroll lock, held until the closed modal has left the document. */
  private unlock: (() => void) | null = null;
  /** Where focus goes back to: the element that had focus before the dialog attached. */
  private openerReturn: FocusReturn | null = null;
  private readonly presence = createPresence({
    getElement: () => this._content(),
    onStateChange: (state) => {
      this._mounted.set(state !== 'unmounted');
      if (state === 'unmounted') {
        this.releaseModal();
        this.flushFocusReturn();
      }
    },
  });
  private returnScheduled = false;
  /** Set by an open the Trigger made; the next capture reads it: such a dialog returns focus to the Trigger. */
  private openedByTrigger = false;
  /** Focus goes back to the trigger once the closed dialog has left the document (it is inert until then). */
  private pendingReturn: { readonly doc: Document; readonly focusReturn: FocusReturn } | null = null;

  private readonly state = computed<DialogState>(() => ({
    id: this.id,
    open: this.open(),
    mounted: this._mounted(),
    hasTitle: this._titles().length > 0,
    titleId: this._titles()[0]?.(),
    hasDescription: this._descriptions() > 0,
    role: this.role(),
    width: this.width(),
    height: this.height(),
    minWidth: this.minWidth(),
    minHeight: this.minHeight(),
    maxWidth: this.maxWidth(),
    maxHeight: this.maxHeight(),
  }));

  /** Whether the native focusing steps focus the `<dialog>` itself: `autoFocus` is `'dialog'` or `false`. @internal */
  readonly _autoFocusDialog = computed(() => this.autoFocus() === 'dialog' || this.autoFocus() === false);

  /** The props of every part. @internal */
  readonly _parts: Signal<DialogParts> = computed(() =>
    getDialogProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => {
      this.presence.destroy();
      this.releaseModal();
    });

    // A declarative dialog follows the location while it is open; the service watches the dialogs it opens.
    effect((onCleanup) => {
      const mode = this.closeOnNavigation();
      if (!this.open() || this._hooks || !this.browser) return;
      untracked(() => {
        onCleanup(
          watchNavigation(this.injector, mode, () => {
            this.open.set(false);
          }),
        );
      });
    });

    // Before the content attaches: the opener is the element that has focus now, and the native focusing steps move
    // it into the dialog afterwards. An open that comes while the closed dialog is still exiting keeps the first one.
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        const byTrigger = this.openedByTrigger;
        this.openedByTrigger = false;
        if (!this._mounted()) {
          this._modalNow.set(this.modal());
          this.opener.set(this._trigger() ? null : deepActiveOrBody(this.doc));
          const returnTo = this._hooks ? this._hooks.returnTo : restoreTarget(this.restoreFocus(), this.doc);
          this.openerReturn =
            returnTo === null
              ? null
              : captureFocusReturn({
                  getTrigger: returnTo === 'opener' ? () => this._trigger() : returnTo,
                  getContent: () => this._content(),
                  restoreTo: returnTo === 'opener' && !byTrigger ? 'opener' : 'trigger',
                  document: this.doc,
                });
        }
      });
    });

    // Opening mounts at once; closing waits for the exit animation (read after the closed state rendered).
    afterRenderEffect({
      write: () => {
        const show = this.open() && this._template() !== null && this.anchor() !== null;
        untracked(() => {
          this.presence.setOpen(show);
        });
      },
    });

    afterRenderEffect({
      write: () => {
        const [mounted, template, anchor] = [this._mounted(), this._template(), this.anchor()];
        untracked(() => {
          if (mounted && template && anchor) this.portal.attach(template, undefined, anchor);
          else this.portal.detach();
        });
      },
    });

    // The content is in the document by now: make it modal. The native focusing steps place focus.
    afterRenderEffect({
      write: () => {
        const dialog = this._content();
        if (!dialog) return;
        untracked(() => {
          if (!dialog.isConnected || dialog.open) return;
          this._hooks?.beforeShow(dialog);
          this.show(dialog);
          if (this._hooks) this._hooks.shown(dialog);
          else applyAutoFocus(dialog, untracked(this.autoFocus), this.renderer);
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const [open, anchor, dialog] = [this.open(), this.anchor(), this._content()];
        // A layer started before the content rendered must not outlive a close made by the parent.
        if (!open)
          untracked(() => {
            this.exitDismissLayer();
            if (!this._mounted()) this.releaseModal();
          });
        if (!open || !anchor || !dialog) return;
        untracked(() => {
          onCleanup(this.engage(anchor.ownerDocument));
        });
      },
    });
  }

  /**
   * Starts what an open Dialog needs: the dismiss layer (Escape, backdrop press) and the scroll lock. When the
   * Dialog closes they only exit: the layer raises no intent, but both stay until the modal has left the document.
   *
   * @param doc - The document of the trigger or opener.
   * @returns The cleanup.
   */
  private engage(doc: Document): () => void {
    this.startDismissLayer();
    if (this._modalNow()) this.unlock ??= lockScroll(doc);
    return () => {
      this.exitDismissLayer();
      // A cleanup caused by closing returns focus; one caused by the Dialog being destroyed does not.
      if (untracked(this.open)) return;
      const focusReturn = this.openerReturn;
      this.openerReturn = null;
      if (focusReturn) this.pendingReturn = { doc, focusReturn };
      if (!untracked(this._mounted)) {
        this.releaseModal();
        this.flushFocusReturn();
      }
    };
  }

  /**
   * Registers the dismiss layer if it is not registered yet. The trigger starts it as soon as the user opens the
   * Dialog, so an Escape that comes before the content has rendered still closes it.
   */
  private startDismissLayer(): void {
    if (this.dismissLayer && !this.dismissExited) return;
    this.stopDismissLayer();
    const layer = this.zone.outside(() =>
      createDismissLayer({
        // Before the content has rendered the anchor stands in for it: the layer needs an element to find the document.
        // A dialog that is not modal is a layer like a non-modal popover: its trigger is inside it.
        getInsideElements: () => [this._content() ?? this.anchor(), ...(this._modalNow() ? [] : [this._trigger()])],
        getNativeDialog: () => this._content(),
        onDismiss: (intent) => {
          this.zone.inside(() => {
            this.dismiss(intent);
          });
        },
        ...(this._modalNow() ? {} : { dismissOn: ['escape', 'outside-press', 'focus-out'] as const }),
        getParent: () => this.parentLayer?.current ?? null,
      }),
    );
    this.dismissLayer = layer;
    this._layer.current = layer;
  }

  /** Decides an intent of the dismiss layer: a press on the backdrop, Escape, or a close the browser made. */
  private dismiss(intent: DismissIntent): void {
    const { event } = intent;
    // A modal dialog does not listen for focus-out. For one that is not modal, it counts as a press outside.
    if (intent.reason === 'focus-out' && this._modalNow()) return;
    const reason = intent.reason === 'focus-out' ? 'outside-press' : intent.reason;
    if (reason === 'outside-press') this._hooks?.backdropPress(event);
    // A close the browser already made (event.type === 'close') cannot be refused.
    const made = event.type === 'close';
    // A refused close keeps the layers below open too.
    if (made) this.send({ type: 'CONTENT.DISMISS', reason, event }, true);
    else if (this.disableClose() || !this.send({ type: 'CONTENT.DISMISS', reason, event })) this.refuse(intent);
  }

  /**
   * Refuses an intent. After a refused press on the backdrop focus stays inside the dialog: if the browser moved
   * it out, it goes back to the element that had it.
   */
  private refuse(intent: DismissIntent): void {
    intent.preventDefault();
    const dialog = this._content();
    if (intent.reason !== 'outside-press' || !dialog) return;
    const active = deepActiveOrBody(this.doc);
    if (!containsDeep(dialog, active)) return;
    scheduleFocus(this.doc, () => {
      if (this.open() && dialog.isConnected && !containsDeep(dialog, deepActiveOrBody(this.doc))) active.focus();
    });
  }

  /** Stops the layer's intents; it stays registered as a barrier until {@link releaseModal}. */
  private exitDismissLayer(): void {
    this.dismissLayer?.exit();
    this.dismissExited = true;
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  private stopDismissLayer(): void {
    const layer = this.dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (this._layer.current === layer) this._layer.current = null;
    this.dismissLayer = null;
    this.dismissExited = false;
  }

  /** The closed modal has left the document (or there was none): the layer and the scroll lock end. */
  private releaseModal(): void {
    this.stopDismissLayer();
    this.unlock?.();
    this.unlock = null;
  }

  private flushFocusReturn(): void {
    const pending = this.pendingReturn;
    this.pendingReturn = null;
    if (!pending) {
      // With a return still to be captured (the close has not been seen by the layer yet) the flush comes again.
      if (!this.openerReturn && !this.returnScheduled) this._hooks?.returned();
      return;
    }
    // A frame later, so the removal of the dialog and the blur of a press have settled.
    this.returnScheduled = true;
    scheduleFocus(pending.doc, () => {
      this.returnScheduled = false;
      if (!this.open()) pending.focusReturn.restore();
      this._hooks?.returned();
    });
  }

  /** Notes how an open starts: whether the trigger made it, and the `modal` of this open period. */
  private beginOpen(open: boolean, reason: DialogChangeReason): void {
    this.openedByTrigger = open && reason === 'trigger';
    // The dismiss layer starts now, before the effect of the open reads `modal`.
    if (open && !this._mounted()) this._modalNow.set(this.modal());
  }

  /** Opens the native dialog the way this open period asks: `showModal()` or `show()`. */
  private show(dialog: HTMLDialogElement): void {
    if (untracked(this._modalNow)) dialog.showModal();
    else dialog.show();
  }

  /**
   * Applies an event: `closePredicate` may refuse a close, then `open` is written and `opened` or `closed` emits.
   *
   * @param event - What happened.
   * @param final - The browser already closed the dialog, so the close cannot be refused.
   * @returns Whether the open state changed.
   */
  private send(event: DialogEvent, final = false): boolean {
    const next = transitionDialog(this.state(), event);
    if (!next) return false;
    const details: DialogChangeDetails = { reason: next.reason, event: event.event };
    if (!next.open && !final && this.closePredicate()?.(details) === false) {
      // A form already closed the native dialog: show it again.
      const dialog = this._content();
      if (event.type === 'CONTENT.CLOSE' && dialog?.isConnected && !dialog.open) this.show(dialog);
      return false;
    }
    this.beginOpen(next.open, next.reason);
    this.open.set(next.open);
    if (next.open) this.startDismissLayer();
    else this.exitDismissLayer();
    (next.open ? this.opened : this.closed).emit(details);
    return true;
  }
}

/**
 * Finds the Dialog root above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The root.
 * @internal
 */
export function injectCckDialogRoot(part: string): CckDialogRoot {
  const root = inject(CckDialogRoot, { optional: true });
  if (!root) throw new Error(`CocoKits: cckDialog${part} must be placed inside an element with cckDialog.`);
  return root;
}
