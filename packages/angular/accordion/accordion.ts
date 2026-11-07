import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Directive,
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import {
  accordionAnatomy,
  getAccordionProps,
  transitionAccordion,
  type AccordionEvent,
  type AccordionRootProps,
  type AccordionState,
} from '@cocokits/machines/accordion';
import { sortByDomOrder } from '@cocokits/utils';

/** What the root needs to know about one item. @internal */
export interface CckAccordionItemRegistration {
  /** The item element. */
  readonly _element: HTMLElement;
  /** The generated id of the item; it is the key in the open value. */
  readonly _id: string;
  /** Whether the item is disabled. */
  readonly disabled: Signal<boolean>;
  /** The value the item or its parent wrote, before single mode picks one item. */
  readonly expanded: Signal<boolean>;
  /** Writes the open state as the component's own change: it emits `expandedChange`, `opened` or `closed`. */
  _commit(open: boolean): void;
  /** Moves focus to the trigger of the item. */
  _focusTrigger(): void;
}

/**
 * Sorts the items into document order.
 *
 * @param items - The registered items.
 * @returns A new array in document order.
 */
function inDomOrder(items: readonly CckAccordionItemRegistration[]): CckAccordionItemRegistration[] {
  const byElement = new Map(items.map((item) => [item._element, item]));
  return sortByDomOrder(items.map((item) => item._element)).flatMap((element) => byElement.get(element) ?? []);
}

/**
 * Accordion: a stack of sections that open and close. Write one `cckAccordionItem` per section inside the
 * host; each item renders its own heading, button and content. By default one item is open at a time;
 * `multi` lets every item toggle on its own. ArrowDown and ArrowUp, Home and End move between the enabled
 * triggers of this accordion. Items of a nested accordion belong to the nearest root.
 *
 * @example
 * <div cckAccordion multi>
 *   <div cckAccordionItem label="Shipping" [(expanded)]="shippingOpen">Orders leave in two days.</div>
 *   <div cckAccordionItem label="Returns">Send it back within 30 days.</div>
 * </div>
 * @cckPart root
 * @cckSlot default - The `cckAccordionItem` sections.
 */
@Directive({
  selector: '[cckAccordion]',
  exportAs: 'cckAccordion',
  host: {
    '[class]': 'rootProps().class',
    '[attr.data-orientation]': 'rootProps()["data-orientation"]',
    '[attr.data-disabled]': 'rootProps()["data-disabled"] ?? null',
    '[attr.data-multiple]': 'rootProps()["data-multiple"] ?? null',
  },
})
export class CckAccordion {
  /**
   * Whether several items can be open at once. Without it, opening an item closes the open one.
   * @defaultValue false
   * @cckSemantic none
   * @cckParity Lets several items stay open at once; each item keeps its own open state.
   */
  readonly multi = input(false, { transform: booleanAttribute });

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(accordionAnatomy);

  private readonly registry = signal<ReadonlySet<CckAccordionItemRegistration>>(new Set());

  /** The items in document order. */
  protected readonly ordered = linkedSignal<
    ReadonlySet<CckAccordionItemRegistration>,
    readonly CckAccordionItemRegistration[]
  >({
    source: this.registry,
    computation: (items) => inDomOrder([...items]),
  });

  /** The id of the item whose trigger has keyboard focus visible. @internal */
  readonly _focusVisibleKey = signal<string | undefined>(undefined);

  private readonly doc = inject(DOCUMENT);
  private focusTracker: FocusVisibleTracker | undefined;
  private previousOpen: ReadonlySet<string> = new Set();

  private readonly requestedOpen = computed(() =>
    this.ordered()
      .filter((item) => item.expanded())
      .map((item) => item._id),
  );

  /** The ids of the open items. In single mode only one stays open: the last in document order. @internal */
  readonly _openKeys = computed(() => {
    const requested = this.requestedOpen();
    return this.multi() || requested.length < 2 ? requested : requested.slice(-1);
  });

  /** The machine state of the accordion. @internal */
  readonly _state = computed<AccordionState>(() => ({
    items: this.ordered().map((item) => ({ key: item._id, disabled: item.disabled() })),
    value: this._openKeys(),
    type: this.multi() ? 'multiple' : 'single',
    collapsible: true,
    focusVisibleKey: this._focusVisibleKey(),
  }));

  /** The props of the root part. */
  protected readonly rootProps = computed<AccordionRootProps>(() => getAccordionProps(this._state()));

  constructor() {
    // The order of the items: a keyed reorder changes no signal the root tracks.
    afterEveryRender({
      read: () => {
        const current = untracked(this.ordered);
        const sorted = inDomOrder(current);
        if (sorted.some((item, index) => item !== current[index])) this.ordered.set(sorted);
      },
    });

    afterNextRender(() => {
      this.focusTracker = trackFocusVisible(this.doc);
    });

    // Single mode: when a write leaves several items open, the one opened last stays; at the start, the last in
    // document order. The others close as the component's own change.
    effect(() => {
      const requested = this.requestedOpen();
      const multi = this.multi();
      untracked(() => {
        const opened = requested.filter((key) => !this.previousOpen.has(key));
        this.previousOpen = new Set(requested);
        if (multi || requested.length < 2) return;
        const keep = opened.at(-1) ?? requested.at(-1);
        for (const item of this.ordered()) if (item._id !== keep && item.expanded()) item._commit(false);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.focusTracker?.destroy();
    });
  }

  /**
   * Opens every item that is not disabled. Does nothing unless `multi` is set.
   *
   * @cckSemantic none
   * @cckParity The open state lives on each item.
   * @example
   * <div cckAccordion multi #accordion="cckAccordion"></div>
   * <button (click)="accordion.openAll()">Open all</button>
   */
  openAll(): void {
    if (!this.multi()) return;
    for (const item of this.ordered()) this._send({ type: 'ITEM.OPEN', key: item._id });
  }

  /**
   * Closes every item that is not disabled.
   * @cckSemantic none
   * @cckParity The open state lives on each item.
   */
  closeAll(): void {
    for (const item of this.ordered()) this._send({ type: 'ITEM.CLOSE', key: item._id });
  }

  /**
   * Registers an item.
   *
   * @param item - The item.
   * @returns The function that unregisters it.
   * @internal
   */
  _register(item: CckAccordionItemRegistration): () => void {
    this.registry.update((items) => new Set(items).add(item));
    return () => {
      this.registry.update((items) => {
        const next = new Set(items);
        next.delete(item);
        return next;
      });
    };
  }

  /**
   * Runs an event through the machine and applies the result: the new open items and the trigger to focus.
   *
   * @param event - The event an item sent.
   * @internal
   */
  _send(event: AccordionEvent): void {
    const result = transitionAccordion(this._state(), event);
    if (result.value !== undefined) {
      const open = new Set(result.value);
      for (const item of this.ordered()) if (item.expanded() !== open.has(item._id)) item._commit(open.has(item._id));
    }
    if (result.focus !== undefined) this._focusTrigger(result.focus);
  }

  /**
   * Finds the trigger that takes focus when an item closes while focus is inside its content.
   *
   * @param key - The id of the closing item.
   * @returns The id of the trigger to focus, or `undefined` when no trigger can take focus.
   * @internal
   */
  _focusTargetOnClose(key: string): string | undefined {
    return transitionAccordion(
      { ...this._state(), value: [key], focusInContent: key },
      { type: 'VALUE.SYNC', value: [] },
    ).focus;
  }

  /**
   * Moves focus to the trigger of an item.
   *
   * @param key - The id of the item.
   * @internal
   */
  _focusTrigger(key: string): void {
    this.ordered()
      .find((item) => item._id === key)
      ?._focusTrigger();
  }

  /**
   * Marks the trigger as keyboard-focused when the last input was the keyboard.
   *
   * @param key - The id of the item whose trigger received focus.
   * @internal
   */
  _onTriggerFocus(key: string): void {
    this._focusVisibleKey.set(this.focusTracker?.isFocusVisible() ? key : undefined);
  }
}

/**
 * Finds the accordion an item sits in.
 *
 * @param part - The calling part, for the error message.
 * @returns The accordion.
 * @internal
 */
export function injectCckAccordion(part: string): CckAccordion {
  const root = inject(CckAccordion, { optional: true });
  if (!root) throw new Error(`CocoKits: ${part} must be placed inside an element with cckAccordion.`);
  return root;
}
