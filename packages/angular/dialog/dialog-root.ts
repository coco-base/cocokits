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
import { IdGenerator, createOverlayOutlet, injectZoneBoundary, themeAttrs } from '@cocokits/angular-core';
import { createDismissLayer, type DismissIntent, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, scheduleFocus, type FocusReturn } from '@cocokits/cdk/focus';
import { createPresence } from '@cocokits/cdk/presence';
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
import { DialogModal } from './dialog-modal';
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
 * A window over the page. The trigger applies the root, so it makes no element: write its inputs and outputs on the `cckDialogTriggerFor` button. It holds the open state and links the trigger, the content, the title, the description and the close button.
 *
 * You write the content as a native `<dialog>` in an `ng-template` and give it to the trigger by reference. It shows in the overlay container. It is modal unless you set `[modal]="false"`: `modal` adds the backdrop, makes the rest of the page inert and stops the page from scrolling. A dialog that is not modal has no backdrop, and the page stays usable. It closes on Escape, on a press outside and when the focus moves outside it, and its trigger opens and closes it.
 *
 * The dialog closes on the close button, Escape, a press on the backdrop and the submit of a `<form method="dialog">` inside it. Then the focus goes back to the element that had it, which is usually the trigger. It also closes when the user goes back or forward in the history, unless you set `[closeOnNavigation]="false"`.
 *
 * Build the content from `cck-dialog-header`, `cck-dialog-body` and `cck-dialog-footer`. Set the size with `width`, `height`, `minWidth`, `minHeight`, `maxWidth` and `maxHeight`; they are the one inline style a part writes.
 *
 * @remarks The focus starts on an element with `autofocus`, or else on the first focusable element. The browser decides what Tab reaches after the last control. Escape closes only the top dialog.
 *
 * The trigger is optional. A dialog without one sits on an `ng-container` with a `cckDialogPortal` template inside. It opens from `open` and shows next to the element that had the focus.
 *
 * To open a dialog from code, use the `CckDialog` service.
 *
 * @example
 * <button type="button" [cckDialogTriggerFor]="deleteProject" [(open)]="deleting">Delete project</button>
 * <ng-template #deleteProject>
 *   <dialog cckDialogContent>
 *     <cck-dialog-header><h2 cckDialogTitle>Delete project</h2></cck-dialog-header>
 *     <cck-dialog-body><cck-dialog-description>This cannot be undone.</cck-dialog-description></cck-dialog-body>
 *     <cck-dialog-footer><button cckDialogClose type="button">Cancel</button></cck-dialog-footer>
 *   </dialog>
 * </ng-template>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The `ng-template` you give to `cckDialogTriggerFor`, with the `<dialog cckDialogContent>` inside. When not set, the build fails, because the input is required.
 */
@Directive({ selector: '[cckDialog]', exportAs: 'cckDialog' })
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
   * <button type="button" [cckDialogTriggerFor]="edit" (opened)="onOpen($event)">Edit</button>
   * <ng-template #edit><dialog cckDialogContent aria-label="Edit">…</dialog></ng-template>
   * <!-- In the class: onOpen(details: DialogChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly opened = output<DialogChangeDetails>();

  /**
   * Emits after the dialog closes itself. It sends the `reason` and the `event`.
   * @remarks The close button, a `<form method="dialog">`, Escape and a press on the backdrop close it. It never emits when the parent changes `open`.
   * @example
   * <button type="button" [cckDialogTriggerFor]="edit" (closed)="onClose($event)">Edit</button>
   * <ng-template #edit><dialog cckDialogContent aria-label="Edit">…</dialog></ng-template>
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
  /** The template of the content; the trigger gives its input. @internal */
  _template: Signal<TemplateRef<unknown> | undefined> = signal(undefined);
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
  /** The portal, the layer and the content injector. The dialog owns them, so another overlay on the trigger keeps its own. */
  private readonly outlet = createOverlayOutlet(CckDialogRoot, this);
  /** The portal of the content; the part that holds the template gives it its view container. @internal */
  readonly _portal = this.outlet.portal;
  /** @internal */
  readonly _layer = this.outlet.layer;
  private readonly zone = injectZoneBoundary();
  /** The dismiss layer, the scroll lock and the focus return, held until the closed modal has left the document. */
  private readonly modalState = new DialogModal({
    layer: this._layer,
    createLayer: () => this.createDismissLayer(),
    isOpen: () => this.open(),
    returned: () => this._hooks?.returned(),
  });
  /** Where focus goes back to: the element that had focus before the dialog attached. */
  private openerReturn: FocusReturn | null = null;
  private readonly presence = createPresence({
    getElement: () => this._content(),
    onStateChange: (state) => {
      this._mounted.set(state !== 'unmounted');
      if (state === 'unmounted') {
        this.modalState.release();
        this.flushFocusReturn();
      }
    },
  });
  /** Set by an open the Trigger made; the next capture reads it: such a dialog returns focus to the Trigger. */
  private openedByTrigger = false;

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
      this.modalState.release();
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
        const show = this.open() && this._template() !== undefined && this.anchor() !== null;
        untracked(() => {
          this.presence.setOpen(show);
        });
      },
    });

    afterRenderEffect({
      write: () => {
        const [mounted, template, anchor] = [this._mounted(), this._template(), this.anchor()];
        untracked(() => {
          if (mounted && template && anchor)
            this._portal.attach(template, undefined, anchor, { injector: this.outlet.injector });
          else this._portal.detach();
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
            this.modalState.exitLayer();
            if (!this._mounted()) this.modalState.release();
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
    this.modalState.startLayer();
    if (this._modalNow()) this.modalState.lock(doc);
    return () => {
      this.modalState.exitLayer();
      // A cleanup caused by closing returns focus; one caused by the Dialog being destroyed does not.
      if (untracked(this.open)) return;
      this.modalState.queueReturn(doc, this.openerReturn);
      this.openerReturn = null;
      if (!untracked(this._mounted)) {
        this.modalState.release();
        this.flushFocusReturn();
      }
    };
  }

  /**
   * The dismiss layer of this open period. The trigger starts it as soon as the user opens the Dialog, so an Escape
   * that comes before the content has rendered still closes it.
   */
  private createDismissLayer(): DismissLayer {
    return this.zone.outside(() =>
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
        getParent: () => this.outlet.parentLayer?.current ?? null,
      }),
    );
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

  /** Returns focus; with a return still to be captured (the layer has not seen the close yet) the flush comes again. */
  private flushFocusReturn(): void {
    this.modalState.flushReturn(this.openerReturn !== null);
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
    if (next.open) this.modalState.startLayer();
    else this.modalState.exitLayer();
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
  if (!root) throw new Error(`CocoKits: cckDialog${part} must be placed inside the template of a cckDialogTriggerFor.`);
  return root;
}
