import {
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  inject,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { TooltipAlign, TooltipContentProps, TooltipSide } from '@cocokits/machines/tooltip';
import type { ThemeAttrs } from '@cocokits/shared';

/** What the content part tells the root about itself. @internal */
export interface TooltipContentRegistration {
  /** The content element, in the portal host. */
  readonly element: HTMLElement;
  /** The wanted side. */
  readonly side: Signal<TooltipSide>;
  /** The wanted alignment. */
  readonly align: Signal<TooltipAlign>;
}

/** What the root gives the bubble of a one-attribute tooltip. @internal */
export interface TooltipBubbleContext {
  /** The message, trimmed. */
  readonly text: Signal<string>;
  /** The props of the content part. */
  readonly props: Signal<TooltipContentProps>;
  /** The theme attributes of the content part. */
  readonly attrs: Signal<ThemeAttrs>;
  /** The wanted side. */
  readonly side: Signal<TooltipSide>;
  /** The wanted alignment. */
  readonly align: Signal<TooltipAlign>;
  /** Where the bubble registers itself, as the content part does. */
  readonly content: WritableSignal<TooltipContentRegistration | null>;
}

/** Hands the {@link TooltipBubbleContext} from the root to the bubble it creates. @internal */
export const TOOLTIP_BUBBLE_CONTEXT = new InjectionToken<TooltipBubbleContext>('TOOLTIP_BUBBLE_CONTEXT');

/**
 * The content of the one-attribute form: a `div` with the content part's class and attributes, showing the
 * message. The root creates it in the overlay container; it is not part of the public API.
 *
 * @internal
 */
@Component({
  selector: 'div[cckTooltipBubble]',
  template: '{{ context.text() }}',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.aria-hidden]': 'props()["aria-hidden"]',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-side]': 'props()["data-side"]',
    '[attr.data-align]': 'props()["data-align"]',
    '(pointerenter)': 'props().onPointerEnter($event)',
    '(pointerleave)': 'props().onPointerLeave($event)',
  },
})
export class CckTooltipBubble {
  protected readonly context = inject(TOOLTIP_BUBBLE_CONTEXT);
  protected readonly props = this.context.props;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const registration = { element, side: this.context.side, align: this.context.align };
    this.context.content.set(registration);
    inject(DestroyRef).onDestroy(() => {
      this.context.content.update((current) => (current === registration ? null : current));
    });
    bindAttrs(element, () => this.context.attrs());
  }
}
