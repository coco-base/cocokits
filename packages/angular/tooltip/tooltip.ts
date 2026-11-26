import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
  untracked,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { CckDirection, IdGenerator, createOverlayOutlet, injectZoneBoundary, themeAttrs } from '@cocokits/angular-core';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import {
  getTooltipProps,
  tooltipAnatomy,
  tooltipIds,
  transitionTooltip,
  type TooltipAlign,
  type TooltipDescription,
  type TooltipEvent,
  type TooltipParts,
  type TooltipSide,
  type TooltipState,
} from '@cocokits/machines/tooltip';
import { type TooltipBubbleContext, type TooltipContentRegistration } from './tooltip-bubble';
import { closeOnAncestorScroll } from './tooltip-scroll';
import { describeTrigger } from './tooltip-description';
import { templateText as templateTextOf } from './tooltip-template-text';
import { bindTooltipHost } from './tooltip-host';
import { CCK_TOOLTIP_DEFAULT_OPTIONS } from './tooltip-options';
import { createTooltipOverlay, type TooltipOverlay, type TooltipOrigin } from './tooltip-overlay';

export type { TooltipContentRegistration } from './tooltip-bubble';

/** The `id` and `aria-describedby` the author gave the trigger. @internal */
export interface TooltipAuthorIds {
  readonly id: Signal<string | null | undefined>;
  readonly describedBy: Signal<string | null | undefined>;
}

const toText = (value: string | number | null | undefined): string => (value == null ? '' : String(value));
const toDelay = (value: unknown): number | undefined => (value == null ? undefined : numberAttribute(value));

/**
 * A short text that shows when the user points at or focuses an element. Put `cckTooltip="Copy link"` on a focusable element. That element is the trigger, and the text describes it.
 *
 * An element with `cckTooltip` that has only an icon needs `aria-label` or `aria-labelledby`.
 *
 * For rich content, put `[cckTooltipTriggerFor]` on the focusable element and give it an `ng-template` with a `cck-tooltip-content`. That trigger applies this root, so write the root's inputs, like `cckTooltipShowDelay`, on the same element. The rich form has no text of its own: the title and the description of the content describe the trigger.
 *
 * The tooltip opens after `cckTooltipShowDelay` on a mouse or pen hover, and at once on keyboard focus. A touch never opens it. It closes after `cckTooltipHideDelay` when the pointer leaves, and at once on blur, Escape, a press on the trigger or a scroll.
 *
 * @remarks With a text, the trigger is described by a hidden copy of the text, also while the tooltip is closed.
 *
 * @example
 * <button cckTooltip="Copy link" type="button">Copy</button>
 * @example
 * <button type="button" [cckTooltipTriggerFor]="copy">Copy</button>
 * <ng-template #copy>
 *   <cck-tooltip-content side="bottom">
 *     <cck-tooltip-arrow></cck-tooltip-arrow>
 *     <b>Copy</b> the link
 *   </cck-tooltip-content>
 * </ng-template>
 * @example
 * <cck-tooltip-content>
 *   <cck-tooltip-title>Copy link</cck-tooltip-title>
 *   <cck-tooltip-description>Copies the address to the clipboard.</cck-tooltip-description>
 * </cck-tooltip-content>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The `ng-template` you give to `cckTooltipTriggerFor` in the rich form, with a `cck-tooltip-content` inside. When not set, the tooltip shows the text of `cckTooltip`.
 */
@Directive({
  selector: '[cckTooltip]',
  exportAs: 'cckTooltip',
})
export class CckTooltip {
  /**
   * The text of the tooltip. Spaces at the start and the end are removed. When not set, the tooltip shows nothing and describes nothing.
   * @remarks Only the one-attribute form has it; in the rich form the title and the description of the content describe the trigger.
   * @cckSemantic tooltip.content.aria-label
   * @cckShortForm
   */
  readonly message = input('', { alias: 'cckTooltip', transform: toText });

  /**
   * How long the tooltip waits to show after a mouse or pen hover, in milliseconds. Keyboard focus shows it at once.
   * @defaultValue 0, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @cckSemantic tooltip.delay
   * @cckDefaultDiffers The delay belongs to the defaults token.
   */
  readonly showDelay = input<number | undefined, unknown>(undefined, {
    alias: 'cckTooltipShowDelay',
    transform: toDelay,
  });

  /**
   * How long the tooltip waits to hide after the pointer leaves, in milliseconds.
   * @remarks While the pointer can move onto the content, the wait is at least 100 milliseconds. So the pointer can cross the gap.
   * @defaultValue 0, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly hideDelay = input<number | undefined, unknown>(undefined, {
    alias: 'cckTooltipHideDelay',
    transform: toDelay,
  });

  /**
   * Whether the tooltip never opens. A disabled tooltip is closed, its content is not rendered and it no longer describes the trigger. A shown tooltip hides at once when it becomes disabled.
   * @defaultValue false
   * @cckSemantic tooltip.disabled
   */
  readonly disabled = input(false, { alias: 'cckTooltipDisabled', transform: booleanAttribute });

  /**
   * The side of the trigger where the tooltip prefers to open. `start` and `end` follow the text direction. The tooltip opens on the other side when there is no room.
   * @defaultValue 'top', from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks In the rich form, set `side` on the `cck-tooltip-content`.
   * @cckSemantic none
   * @cckParity Only the one-attribute form has it.
   * @cckShortForm
   */
  readonly side = input<TooltipSide | undefined>(undefined, { alias: 'cckTooltipSide' });

  /**
   * How the tooltip lines up with the edge of the trigger.
   * @defaultValue 'center', from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks In the rich form, set `align` on the `cck-tooltip-content`.
   * @cckSemantic none
   * @cckParity Only the one-attribute form has it.
   * @cckShortForm
   */
  readonly align = input<TooltipAlign | undefined>(undefined, { alias: 'cckTooltipAlign' });

  /**
   * Whether a tooltip that the pointer opens shows at the point where the pointer entered the trigger. A tooltip that keyboard focus opens still shows at the trigger.
   * @remarks `show()` without a point also places the tooltip at the trigger.
   * @defaultValue false, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly positionAtOrigin = input<boolean | undefined, unknown>(undefined, {
    alias: 'cckTooltipPositionAtOrigin',
    transform: (value: unknown) => (value == null ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether Escape and a press outside keep the tooltip open. The pointer leaving, a blur, a press on the trigger and a scroll still close it.
   * @remarks Without Escape, a keyboard user cannot hide the tooltip. That fails WCAG 1.4.13, unless the user can hide it another way. The name has the `cckTooltip` prefix, so the `disableClose` of a menu, popover or dialog trigger on the same element never sets it.
   * @defaultValue false
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly disableClose = input(false, { alias: 'cckTooltipDisableClose', transform: booleanAttribute });

  /**
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @remarks In the rich form, set `id` on the `cckTooltipTriggerFor`. A menu, popover or dialog trigger on the same element owns the `id`, so the tooltip then leaves it alone.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   * @cckShortForm
   */
  readonly id = input<string | null | undefined>(null);

  /**
   * The ids of the elements that describe the trigger. The tooltip adds its own id after them. When not set, only the tooltip describes the trigger.
   * @remarks In the rich form, set it on the `cckTooltipTriggerFor`.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   * @cckShortForm
   */
  readonly ariaDescribedby = input<string | null | undefined>(null, { alias: 'aria-describedby' });

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(tooltipAnatomy);

  /** @internal */
  readonly _content = signal<TooltipContentRegistration | null>(null);
  /** The template of the rich form; the trigger gives its input. @internal */
  _template: Signal<TemplateRef<unknown> | null> = signal(null);
  /** The `id` and `aria-describedby` the author gave the trigger; the rich trigger gives its own inputs. @internal */
  _authorIds: TooltipAuthorIds = { id: this.id, describedBy: this.ariaDescribedby };
  /** The arrow element a `cck-tooltip-arrow` registered; the content positions it. @internal */
  readonly _arrow = signal<HTMLElement | null>(null);

  /** The element the root sits on: the trigger, in both forms. */
  private readonly trigger = signal(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement).asReadonly();

  private readonly text = computed(() => this.message().trim());
  /** Whether there is something to show: a template, or a message. */
  private readonly hasContent = computed(() => this._template() !== null || this.text() !== '');
  private readonly isOpen = signal(false);
  /** The point the open tooltip was opened at, when it was opened with one. */
  private readonly origin = signal<TooltipOrigin | null>(null);
  /** The point the next opening uses; set by a pointer entering, a focus or `show()`. */
  private nextOrigin: TooltipOrigin | null = null;
  private readonly description = signal<TooltipDescription>('none');
  private readonly tooltipId = inject(IdGenerator).getId(tooltipAnatomy.classes.root);
  private readonly options = inject(CCK_TOOLTIP_DEFAULT_OPTIONS);
  private readonly injector = inject(Injector);
  private readonly renderer = inject(Renderer2);
  /** The portal, the layer and the content injector. The tooltip owns them, so another overlay on the trigger keeps its own. */
  private readonly outlet = createOverlayOutlet(CckTooltip, this);
  private readonly direction = inject(CckDirection);
  private readonly zone = injectZoneBoundary();
  private readonly shown = computed(() => this.isOpen() && !this.disabled());
  /** The point the content is placed against: only with `positionAtOrigin` and an origin. */
  private readonly anchorPoint = computed(() =>
    (this.positionAtOrigin() ?? this.options.positionAtOrigin ?? false) ? this.origin() : null,
  );
  private readonly overlay: TooltipOverlay;
  private focusVisible: FocusVisibleTracker | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  private readonly state = computed<TooltipState>(() => ({
    id: this.tooltipId,
    open: this.isOpen(),
    mounted: this.overlay.mounted(),
    disabled: this.disabled(),
    delay: this.showDelay() ?? this.options.showDelay,
    closeDelay: this.hideDelay() ?? this.options.hideDelay,
    disableHoverableContent: this.options.disableTooltipInteractivity ?? false,
    arrowHidden: this.overlay.arrowHidden(),
    description: this.description(),
    side: this.overlay.placement()?.side ?? this._content()?.side(),
    align: this.overlay.placement()?.align ?? this._content()?.align(),
    isFocusVisible: () => this.focusVisible?.isFocusVisible() ?? false,
  }));

  /** The props of the trigger and the content. @internal */
  readonly _parts: Signal<TooltipParts> = computed(() => {
    const parts = getTooltipProps(this.state(), (event) => {
      this.send(event);
    });
    const { trigger } = parts;
    // The point of a pointer entering or the lack of one (focus) is the origin of the opening they cause.
    return {
      ...parts,
      trigger: {
        ...trigger,
        onPointerEnter: (event: PointerEvent) => {
          this.nextOrigin = { x: event.clientX, y: event.clientY };
          trigger.onPointerEnter(event);
        },
        onFocus: (event: FocusEvent) => {
          this.nextOrigin = null;
          trigger.onFocus(event);
        },
      },
    };
  });

  private readonly bubbleContext: TooltipBubbleContext = {
    text: this.text,
    props: computed(() => this._parts().content),
    attrs: computed(() => this._theme().content),
    side: computed(() => this.side() ?? this.options.side ?? 'top'),
    align: computed(() => this.align() ?? this.options.align ?? 'center'),
    content: this._content,
  };

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.cancel();
      this.overlay.destroy();
    });
    // The content is created next to the trigger, so it is checked with the trigger's view.
    this.outlet.portal.useContainer(inject(ViewContainerRef));
    bindTooltipHost({
      host: this.trigger(),
      parts: this._parts,
      theme: computed(() => this._theme().trigger),
      id: computed(() => this._authorIds.id()),
      describedBy: computed(() => this._authorIds.describedBy()),
    });

    // Nothing is tracked on the server, where nothing can be focused anyway. The document is the trigger's own.
    afterRenderEffect({
      write: (onCleanup) => {
        const tracker = this.zone.outside(() => trackFocusVisible(this.trigger().ownerDocument));
        this.focusVisible = tracker;
        onCleanup(() => {
          tracker.destroy();
          if (this.focusVisible === tracker) this.focusVisible = null;
        });
      },
    });

    // A disabled tooltip drops its pending change and hides at once.
    afterRenderEffect(() => {
      if (this.disabled()) {
        untracked(() => {
          this.cancel();
          this.isOpen.set(false);
        });
      }
    });

    const hasBubble = computed(() => this._template() === null && this.text() !== '');
    this.overlay = createTooltipOverlay({
      shown: this.shown,
      hasContent: this.hasContent,
      trigger: this.trigger,
      template: computed(() => this._template()),
      hasBubble,
      bubbleContext: this.bubbleContext,
      content: this._content,
      arrow: this._arrow,
      anchorPoint: this.anchorPoint,
      disableClose: this.disableClose,
      send: (event) => {
        this.send(event);
      },
      injector: this.injector,
      outlet: this.outlet,
      zone: this.zone,
      direction: this.direction,
    });

    closeOnAncestorScroll({
      active: this.shown,
      trigger: this.trigger,
      onScroll: (event) => {
        this.send({ type: 'ANCESTOR.SCROLL', event });
      },
    });

    const templateText = templateTextOf(
      computed(() => this._template()),
      this.shown,
      this.outlet.injector,
    );
    describeTrigger({
      trigger: this.trigger,
      // The message, else the text of the title and the description in the content template.
      text: computed(() => this.text() || templateText()),
      disabled: this.disabled,
      id: tooltipIds(this.tooltipId).description,
      state: this.description,
    });
  }

  /**
   * Shows the tooltip after `delay`. It does nothing while the tooltip is disabled, empty or shown. It replaces a show or hide that is still waiting.
   *
   * @param delay - How long to wait, in milliseconds. When not set, it waits the show delay.
   * @param origin - The point where the tooltip shows, with `cckTooltipPositionAtOrigin`. When not set, the tooltip shows at the trigger.
   * @example
   * <button cckTooltip="Copy link" #tip="cckTooltip" type="button" (focus)="tip.show(0)">Copy</button>
   * @cckParity Opens the tooltip with `show()`; there is no open state to bind.
   * @cckSemantic none
   */
  show(delay: number = this.showDelay() ?? this.options.showDelay, origin?: TooltipOrigin): void {
    if (this.disabled() || !this.hasContent()) return;
    if (this.isOpen() && this.timer === undefined) return;
    this.nextOrigin = origin ?? null;
    this.change(true, delay);
  }

  /**
   * Hides the tooltip after `delay`. It replaces a show or hide that is still waiting.
   *
   * @param delay - How long to wait, in milliseconds. When not set, it waits the hide delay.
   * @example
   * <button cckTooltip="Copy link" #tip="cckTooltip" type="button" (click)="tip.hide(0)">Copy</button>
   * @cckParity Closes the tooltip with `hide()`; there is no open state to bind.
   * @cckSemantic none
   */
  hide(delay: number = this.hideDelay() ?? this.options.hideDelay): void {
    this.change(false, delay);
  }

  /**
   * Hides the tooltip when it is shown, and shows it when it is hidden.
   *
   * @param origin - The point that `show()` takes, when the tooltip shows.
   * @example
   * <button cckTooltip="Copy link" #tip="cckTooltip" type="button" (click)="tip.toggle()">Copy</button>
   * @cckParity Switches the tooltip with `toggle()`; there is no open state to bind.
   * @cckSemantic none
   */
  toggle(origin?: TooltipOrigin): void {
    if (this.isOpen()) this.hide();
    else this.show(undefined, origin);
  }

  private cancel(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  /** Asks the machine what the event does, then applies the change it schedules. */
  private send(event: TooltipEvent): void {
    const next = transitionTooltip(this.state(), event);
    if (!next) return;
    this.cancel();
    if (next.schedule) this.change(next.schedule.open, next.schedule.delay);
  }

  /** Cancels the pending change, then applies `open` after `delay` milliseconds (at once for `0`). */
  private change(open: boolean, delay: number): void {
    this.cancel();
    const apply = (): void => {
      this.timer = undefined;
      if (this.isOpen() === open || this.disabled()) return;
      if (open) this.origin.set(this.nextOrigin);
      this.isOpen.set(open);
      if (open) this.overlay.startDismissLayer();
      else this.overlay.stopDismissLayer();
    };
    // The delay timer starts outside the zone; only its callback, which writes state, comes back in.
    if (delay > 0) {
      this.timer = this.zone.outside(() =>
        setTimeout(() => {
          this.zone.inside(apply);
        }, delay),
      );
    } else apply();
  }
}

/**
 * Finds the Tooltip root above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The root.
 * @internal
 */
export function injectCckTooltip(part: string): CckTooltip {
  const root = inject(CckTooltip, { optional: true });
  if (!root)
    throw new Error(`CocoKits: cckTooltip${part} must be placed inside the template of a cckTooltipTriggerFor.`);
  return root;
}
