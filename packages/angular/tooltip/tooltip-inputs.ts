import { Directive, booleanAttribute, input, numberAttribute } from '@angular/core';
import type { TooltipAlign, TooltipSide } from '@cocokits/machines/tooltip';

const toText = (value: string | number | null | undefined): string => (value == null ? '' : String(value));
const toDelay = (value: unknown): number | undefined => (value == null ? undefined : numberAttribute(value));

/**
 * The inputs of `CckTooltip`. They sit in their own class so that no file passes the size limit; `CckTooltip`
 * holds the state and the behaviour. Not for direct use or extension.
 */
@Directive()
export abstract class CckTooltipInputs {
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
   * @cckDefaultDiffers The delay belongs to the defaults token here and to the Provider in React and Vue.
   */
  readonly showDelay = input<number | undefined, unknown>(undefined, {
    alias: 'cckTooltipShowDelay',
    transform: toDelay,
  });

  /**
   * Milliseconds between the pointer leaving the trigger and the content and the tooltip hiding. At least
   * 100 ms apply while the content is hoverable, so the pointer can cross the gap to the content.
   * @defaultValue 0, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks Angular only, as in Angular Material: Radix and Reka have no close delay.
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
   */
  readonly side = input<TooltipSide | undefined>(undefined, { alias: 'cckTooltipSide' });

  /**
   * How the bubble lines up along the trigger's edge in the one-attribute form.
   * @defaultValue 'center', from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks The compound form sets it on the content part.
   * @cckSemantic none
   */
  readonly align = input<TooltipAlign | undefined>(undefined, { alias: 'cckTooltipAlign' });

  /**
   * Whether a tooltip the pointer opens is placed against the point where the pointer entered the trigger,
   * not against the trigger box. Opened by keyboard focus or by `show()` without an origin, it is placed
   * against the trigger.
   * @defaultValue false, from `CCK_TOOLTIP_DEFAULT_OPTIONS`
   * @remarks Angular only, as in Angular Material (`matTooltipPositionAtOrigin`).
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
   * @remarks Angular only: React refuses with `onEscapeKeyDown` and `onPointerDownOutside`, Vue with the `escapeKeyDown` and `pointerDownOutside` events.
   * @cckSemantic none
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * The id of the trigger in the one-attribute form; it wins over the generated one and follows changes.
   * @remarks Angular only: React and Vue triggers take `id` as a native prop. Does nothing on a compound root; the trigger part takes it.
   * @cckSemantic none
   */
  readonly id = input<string | null | undefined>(null);

  /**
   * The ids that describe the trigger in the one-attribute form; the tooltip adds its own to them.
   * @remarks Angular only: React and Vue triggers take `aria-describedby` as a native prop. Does nothing on a compound root; the trigger part takes it.
   * @cckSemantic none
   */
  readonly ariaDescribedby = input<string | null | undefined>(null, { alias: 'aria-describedby' });
}
