import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  Renderer2,
  ViewContainerRef,
  afterNextRender,
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
import {
  CckDirection,
  CckOverlayLayer,
  CckPortal,
  IdGenerator,
  injectZoneBoundary,
  themeAttrs,
} from '@cocokits/angular-core';
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
import { bindTooltipHost } from './tooltip-host';
import { CCK_TOOLTIP_DEFAULT_OPTIONS } from './tooltip-options';
import { createTooltipOverlay, type TooltipOverlay, type TooltipOrigin } from './tooltip-overlay';

export type { TooltipContentRegistration } from './tooltip-bubble';

const ELEMENT_NODE = 1;

const toText = (value: string | number | null | undefined): string => (value == null ? '' : String(value));
const toDelay = (value: unknown): number | undefined => (value == null ? undefined : numberAttribute(value));

/**
 * A Tooltip. Put `cckTooltip="Copy link"` on the focusable element: the host is the trigger, the message is
 * what the bubble shows and the text that describes the trigger. For rich content use the compound form on an
 * `ng-container`: `cckTooltipTrigger`, an `ng-template` with `cckTooltipPortal` and `cckTooltipContent`; the
 * message then is only the description. It opens after `cckTooltipShowDelay` on a mouse or pen hover and at
 * once on keyboard focus (touch never opens it), and closes after `cckTooltipHideDelay` when the pointer leaves,
 * on blur, Escape, a press on the trigger and when an ancestor of the trigger scrolls. With a message the
 * trigger is described by a hidden copy of it, also while closed (after hydration).
 *
 * @example
 * <button cckTooltip="Copy link">Copy</button>
 * @example
 * <ng-container cckTooltip="Copy link">
 *   <button cckTooltipTrigger>Copy</button>
 *   <ng-template cckTooltipPortal><div cckTooltipContent><b>Copy</b> the link</div></ng-template>
 * </ng-container>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The trigger and the portal template of the compound form.
 */
@Directive({
  selector: '[cckTooltip]',
  exportAs: 'cckTooltip',
  providers: [CckPortal, CckOverlayLayer],
})
export class CckTooltip {
  /**
   * The text of the tooltip, trimmed. In the one-attribute form it is shown and describes the trigger; an empty
   * message shows nothing. In the compound form it only describes the trigger, and the template is shown.
   * @cckSemantic tooltip.content.aria-label
   */
  readonly message = input('', { alias: 'cckTooltip', transform: toText });

  /**
   * Milliseconds between a mouse or pen hover and the tooltip showing. Keyboard focus shows it at once.
   * @defaultValue 0, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @cckSemantic tooltip.delay
   * @cckDefaultDiffers The delay belongs to the defaults token.
   */
  readonly showDelay = input<number | undefined, unknown>(undefined, {
    alias: 'cckTooltipShowDelay',
    transform: toDelay,
  });

  /**
   * Milliseconds between the pointer leaving the trigger and the content and the tooltip hiding. At least
   * 100 ms apply while the content is hoverable, so the pointer can cross the gap to the content.
   * @defaultValue 0, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly hideDelay = input<number | undefined, unknown>(undefined, {
    alias: 'cckTooltipHideDelay',
    transform: toDelay,
  });

  /**
   * Whether the tooltip never opens. A disabled tooltip is closed, hides at once when it is turned on while
   * shown, and has no description.
   * @defaultValue false
   * @cckSemantic tooltip.disabled
   */
  readonly disabled = input(false, { alias: 'cckTooltipDisabled', transform: booleanAttribute });

  /**
   * The side of the trigger the bubble prefers in the one-attribute form. `start` and `end` follow the
   * direction; it flips when there is no room.
   * @defaultValue 'top', from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks The compound form sets it on the content part.
   * @cckSemantic none
   * @cckParity Only the one-attribute form has it.
   */
  readonly side = input<TooltipSide | undefined>(undefined, { alias: 'cckTooltipSide' });

  /**
   * How the bubble lines up along the trigger's edge in the one-attribute form.
   * @defaultValue 'center', from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks The compound form sets it on the content part.
   * @cckSemantic none
   * @cckParity Only the one-attribute form has it.
   */
  readonly align = input<TooltipAlign | undefined>(undefined, { alias: 'cckTooltipAlign' });

  /**
   * Whether a tooltip the pointer opens is placed against the point where the pointer entered the trigger,
   * not against the trigger box. Opened by keyboard focus or by `show()` without an origin, it is placed
   * against the trigger.
   * @defaultValue false, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly positionAtOrigin = input<boolean | undefined, unknown>(undefined, {
    alias: 'cckTooltipPositionAtOrigin',
    transform: (value: unknown) => (value == null ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether Escape and an outside press keep the tooltip open. Pointer leave, blur, a press on the trigger and
   * a scroll still close it. Refusing Escape leaves the tooltip undismissable by keyboard, which fails WCAG 1.4.13
   * (Content on Hover or Focus) unless the content can be dismissed another way; that is your choice to make.
   * @defaultValue false
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * The id of the trigger in the one-attribute form; it wins over the generated one and follows changes.
   * @remarks Does nothing on a compound root; the trigger part takes it.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | null | undefined>(null);

  /**
   * The ids that describe the trigger in the one-attribute form; the tooltip adds its own to them.
   * @remarks Does nothing on a compound root; the trigger part takes it.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly ariaDescribedby = input<string | null | undefined>(null, { alias: 'aria-describedby' });

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(tooltipAnatomy);

  /** The trigger element a `cckTooltipTrigger` part registered. @internal */
  readonly _triggerPart = signal<HTMLElement | null>(null);
  /** @internal */
  readonly _content = signal<TooltipContentRegistration | null>(null);
  /** @internal */
  readonly _template = signal<TemplateRef<void> | null>(null);
  /** The arrow element a `cckTooltipArrow` registered; the content positions it. @internal */
  readonly _arrow = signal<HTMLElement | null>(null);

  private readonly host = inject<ElementRef<Node>>(ElementRef).nativeElement;
  /** The host when it is an element (the one-attribute form); a comment for an `ng-container`. */
  private readonly hostElement = this.host.nodeType === ELEMENT_NODE ? (this.host as HTMLElement) : null;
  /** Whether the host is the trigger: it is an element and no compound part registered a template. */
  private readonly hostIsTrigger = computed(() => this.hostElement !== null && this._template() === null);
  /** The trigger of the tooltip. @internal */
  readonly _trigger = computed(() => this._triggerPart() ?? (this.hostIsTrigger() ? this.hostElement : null));

  private readonly text = computed(() => this.message().trim());
  /** Whether there is something to show: a template, or a message on the host trigger. */
  private readonly hasContent = computed(
    () => this._template() !== null || (this.hostIsTrigger() && this.text() !== ''),
  );
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
  private readonly portal = inject(CckPortal);
  private readonly direction = inject(CckDirection);
  private readonly zone = injectZoneBoundary();
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
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
    if (this.hostElement) {
      // The host is the anchor of the bubble; an `ng-container` root must not inject a container (hydration).
      this.portal.useContainer(inject(ViewContainerRef));
      bindTooltipHost({
        host: this.hostElement,
        active: this.hostIsTrigger,
        parts: this._parts,
        theme: computed(() => this._theme().trigger),
        id: this.id,
        describedBy: this.ariaDescribedby,
      });
    }

    // Nothing is tracked on the server, where nothing can be focused anyway. The document is the trigger's own.
    afterRenderEffect({
      write: (onCleanup) => {
        const trigger = this._trigger();
        if (!trigger) return;
        const tracker = this.zone.outside(() => trackFocusVisible(trigger.ownerDocument));
        this.focusVisible = tracker;
        onCleanup(() => {
          tracker.destroy();
          if (this.focusVisible === tracker) this.focusVisible = null;
        });
      },
    });

    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      // The content renders only once there is a trigger to anchor it, so a missing trigger needs a message.
      if (this._template() && !this._triggerPart()) {
        console.warn(
          'CocoKits: a TooltipPortal has no TooltipTrigger, so its content never opens. Add a cckTooltipTrigger inside the same cckTooltip.',
        );
      }
      if (!this.hostElement && !this._template() && this.text() !== '') {
        console.warn(
          'CocoKits: cckTooltip with a message needs an element to show it: put it on the focusable element, or add a cckTooltipTrigger and a cckTooltipPortal inside the ng-container.',
        );
      }
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

    const hasBubble = computed(() => this.hostIsTrigger() && this.text() !== '');
    this.overlay = createTooltipOverlay({
      shown: this.shown,
      hasContent: this.hasContent,
      trigger: this._trigger,
      template: this._template,
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
      portal: this.portal,
      zone: this.zone,
      direction: this.direction,
      layer: inject(CckOverlayLayer),
      parentLayer: this.parentLayer,
    });

    closeOnAncestorScroll({
      active: this.shown,
      trigger: this._trigger,
      onScroll: (event) => {
        this.send({ type: 'ANCESTOR.SCROLL', event });
      },
    });

    describeTrigger({
      trigger: this._trigger,
      text: this.text,
      disabled: this.disabled,
      id: tooltipIds(this.tooltipId).description,
      state: this.description,
    });
  }

  /**
   * Shows the tooltip after `delay`. Does nothing while disabled, with nothing to show or while it is shown;
   * otherwise it replaces a pending change.
   *
   * @param delay - Milliseconds to wait. @defaultValue the show delay
   * @param origin - The point in viewport coordinates the tooltip is placed against with `cckTooltipPositionAtOrigin`; without it the tooltip is placed against the trigger.
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
   * Hides the tooltip after `delay`, and replaces a pending change.
   *
   * @param delay - Milliseconds to wait. @defaultValue the hide delay
   * @cckParity Closes the tooltip with `hide()`; there is no open state to bind.
   * @cckSemantic none
   */
  hide(delay: number = this.hideDelay() ?? this.options.hideDelay): void {
    this.change(false, delay);
  }

  /**
   * Hides the tooltip when it is shown, else shows it.
   *
   * @param origin - The point `show` takes, used when the tooltip is shown.
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
  if (!root) throw new Error(`CocoKits: cckTooltip${part} must be placed inside an element with cckTooltip.`);
  return root;
}
