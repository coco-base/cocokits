import {
  DOCUMENT,
  DestroyRef,
  Directive,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
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
import type { ChangeDetails } from '@cocokits/shared';
import { containsDeep } from '@cocokits/utils';
import { deepActiveOrBody } from './dialog-focus';

/** Why the open state of a Dialog changed. */
export type DialogOpenChangeReason = DialogChangeReason;

/** What `opened`, `closed` and `closePredicate` of a Dialog receive: why the change happened and the event behind it. */
export type DialogChangeDetails = ChangeDetails<DialogOpenChangeReason>;

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
  /** Called right after `showModal()`: place focus. */
  shown(dialog: HTMLDialogElement): void;
  /** Called once the closed dialog has left the document and focus went back (or did not). */
  returned(): void;
  /**
   * Where focus goes back to. `'opener'` is the element that had focus when the dialog opened, a function
   * resolves the target at close, `null` returns nothing.
   */
  readonly returnTo: 'opener' | (() => HTMLElement | null) | null;
}

/** What the service writes onto the `<dialog>` besides the machine's attributes. @internal */
export interface DialogServiceAttrs {
  readonly id?: string | undefined;
  readonly role?: 'dialog' | 'alertdialog' | undefined;
  readonly label?: string | null | undefined;
  readonly labelledBy?: readonly string[] | null | undefined;
  readonly describedBy?: readonly string[] | null | undefined;
  readonly modal?: boolean | undefined;
  /** The native focusing steps focus the `<dialog>` itself. */
  readonly autofocus?: boolean | undefined;
}

/**
 * The root of a Dialog: it renders no element, it holds the open state and connects the trigger, the
 * content, the title, the description and the Close button. The content is a native `dialog` declared in a
 * `cckDialogPortal` template and rendered in the overlay container (an open modal dialog that holds the
 * trigger, else the end of `<body>`), then opened with `showModal()`: the rest of the page is inert, Tab moves
 * through its controls (the browser decides what follows the last one) and focus starts where the browser puts it (an `autofocus` element, else the first focusable).
 * It closes on Close, on Escape (the topmost layer only), on a press on the backdrop and when a
 * `<form method="dialog">` inside it is submitted. The page does not scroll while it is open, and focus returns
 * to the element that had it when the dialog opened (the trigger, usually). The trigger is optional: a
 * dialog without one opens from `open` and renders next to the element that had focus.
 *
 * @example
 * <ng-container cckDialog [(open)]="deleting">
 *   <button cckDialogTrigger>Delete project</button>
 *   <ng-template cckDialogPortal>
 *     <dialog cckDialogContent>
 *       <h2 cckDialogTitle>Delete project</h2>
 *       <p cckDialogDescription>This cannot be undone.</p>
 *       <button cckDialogClose>Cancel</button>
 *     </dialog>
 *   </ng-template>
 * </ng-container>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The trigger and the portal template.
 */
@Directive({
  selector: '[cckDialog]',
  exportAs: 'cckDialog',
  providers: [CckPortal, CckOverlayLayer],
})
export class CckDialogRoot {
  /**
   * Whether the dialog is open. Two-way, one-way (the start value) or unbound.
   * @remarks The model output `openChange` emits the new value when the dialog changes itself. `opened` and `closed` emit the reason, for the dialog's own changes only.
   * @defaultValue false
   */
  readonly open = model(false);

  /**
   * Whether Escape and a press on the backdrop leave the dialog open. The check runs first, before
   * `closePredicate`, `open` and `closed`; Close, `<form method="dialog">`, the trigger and a write from the
   * parent still close. Disabling these closes weakens the dialog pattern: a keyboard user then has only the
   * controls inside the dialog to leave it, so keep a Close button.
   * @defaultValue false
   * @remarks Angular only: React refuses with `onEscapeKeyDown` and `onPointerDownOutside`, Vue with the `escapeKeyDown` and `pointerDownOutside` events.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/cdk/dialog/dialog-config.ts DialogConfig.disableClose
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * Decides, for every close the dialog makes itself (Close, the trigger, `<form method="dialog">`, Escape, a
   * press on the backdrop), whether it happens: `false` keeps the dialog open. It runs after `disableClose`.
   * A write to `open` from the parent is never checked. A refused `<form method="dialog">` shows the dialog
   * again. Refusing weakens the dialog pattern (see `disableClose`).
   * @remarks Angular only: React refuses with `details.cancel()` in `onOpenChange`, Vue by not taking `update:open`.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/material/dialog/dialog-config.ts MatDialogConfig.closePredicate
   */
  readonly closePredicate = input<((details: DialogChangeDetails) => boolean) | undefined>(undefined);

  /**
   * Emits after the dialog opens by itself (the trigger), with the reason and the event. Never for a write from the parent.
   * @remarks Angular only: React and Vue report an open through `onOpenChange` and `update:open`.
   * @cckSemantic none
   */
  readonly opened = output<DialogChangeDetails>();

  /**
   * Emits after the dialog closes by itself (Close, `<form method="dialog">`, Escape, a press on the backdrop), with the reason and the event.
   * Never for a write from the parent.
   * @remarks Angular only: React and Vue report a close through `onOpenChange` and `update:open`.
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
  }));

  /** The props of every part. @internal */
  readonly _parts: Signal<DialogParts> = computed(() =>
    getDialogProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.presence.destroy();
      this.releaseModal();
    });

    // Before the content attaches: the opener is the element that has focus now, and the native focusing steps move
    // it into the dialog afterwards. An open that comes while the closed dialog is still exiting keeps the first one.
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        const byTrigger = this.openedByTrigger;
        this.openedByTrigger = false;
        if (!this._mounted()) {
          this.opener.set(this._trigger() ? null : deepActiveOrBody(this.doc));
          const returnTo = this._hooks ? this._hooks.returnTo : 'opener';
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
          dialog.showModal();
          this._hooks?.shown(dialog);
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
    this.unlock ??= lockScroll(doc);
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
        getInsideElements: () => [this._content() ?? this.anchor()],
        getNativeDialog: () => this._content(),
        onDismiss: (intent) => {
          this.zone.inside(() => {
            this.dismiss(intent);
          });
        },
        getParent: () => this.parentLayer?.current ?? null,
      }),
    );
    this.dismissLayer = layer;
    this._layer.current = layer;
  }

  /** Decides an intent of the dismiss layer: a press on the backdrop, Escape, or a close the browser made. */
  private dismiss(intent: DismissIntent): void {
    const { reason, event } = intent;
    if (reason === 'focus-out') return;
    if (reason === 'outside-press') this._hooks?.backdropPress(event);
    // A close the browser already made (event.type === 'close') cannot be refused.
    const made = event.type === 'close';
    // A refused close keeps the layers below open too.
    if (made) this.send({ type: 'CONTENT.DISMISS', reason, event }, true);
    else if (this.disableClose() || !this.send({ type: 'CONTENT.DISMISS', reason, event })) this.refuse(intent);
  }

  /**
   * Refuses an intent. After a refused press on the backdrop focus stays inside the dialog: if the browser moved
   * it out, it goes back to the element that had it (Angular CDK `dialog-ref.ts`).
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
      if (event.type === 'CONTENT.CLOSE' && dialog?.isConnected && !dialog.open) dialog.showModal();
      return false;
    }
    this.openedByTrigger = next.open && next.reason === 'trigger';
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
