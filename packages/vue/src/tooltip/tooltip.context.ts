import { inject, type ComputedRef, type InjectionKey, type ShallowRef, type ComponentPublicInstance } from 'vue';
import type { OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { TooltipDescription, TooltipEvent, TooltipGroup } from '@cocokits/machines/tooltip';

/** What a TooltipRoot gives its parts. */
export interface TooltipContextValue {
  /** The id the part ids derive from (`useId()` of the root). */
  readonly id: string;
  /** Whether the tooltip is shown: open and not disabled. */
  readonly open: ComputedRef<boolean>;
  /** Whether the tooltip is disabled. */
  readonly disabled: ComputedRef<boolean>;
  /** Whether the content is in the document: shown, or hidden with its exit animation still running. */
  readonly mounted: ShallowRef<boolean>;
  /** The trigger element; `null` until the trigger mounted. */
  readonly triggerElement: ShallowRef<HTMLElement | null>;
  /** Makes the element of this trigger instance the live `triggerElement`; `null` on unmount. */
  readonly followTrigger: (instance: ComponentPublicInstance | null) => void;
  /** The content element; `null` while it is not rendered. */
  readonly contentElement: ShallowRef<HTMLElement | null>;
  /** What the trigger's `reference` places the content against; `null` places it against the trigger. */
  readonly reference: ShallowRef<Element | OverlayVirtualAnchor | null>;
  /** The arrow element; `null` without an arrow. */
  readonly arrowElement: ShallowRef<HTMLElement | null>;
  /** Whether the arrow cannot point at the anchor, as the positioning reports it. */
  readonly arrowHidden: ShallowRef<boolean>;
  /** How the trigger is described; `none` until the root mounted, so the markup of the server matches. */
  readonly description: ShallowRef<TooltipDescription>;
  /** The text the content reports as the description of the trigger; `null` when it has none. */
  readonly descriptionText: ShallowRef<string | null>;
  /** The `aria-label` the trigger reports, so a description equal to it is suppressed. */
  readonly triggerLabel: ShallowRef<string | undefined>;
  /** Whether the last input was the keyboard; `false` until the root mounted. */
  readonly isFocusVisible: () => boolean;
  /** Hands an event of a part to the machine; the root runs the timers and applies the change. */
  readonly send: (event: TooltipEvent) => void;
}

/** What a TooltipProvider gives the roots inside it. */
export interface TooltipProviderContextValue {
  readonly delayDuration: ComputedRef<number>;
  readonly disableHoverableContent: ComputedRef<boolean>;
  readonly disableClosingTrigger: ComputedRef<boolean>;
  readonly disabled: ComputedRef<boolean>;
  /** The delay group of the provider. */
  readonly group: ComputedRef<TooltipGroup>;
}

/** Injection key of the tooltip provider. Not exported from any entry point. */
export const TOOLTIP_PROVIDER_KEY: InjectionKey<TooltipProviderContextValue> = Symbol('cck-tooltip-provider');

/** Injection key of the tooltip context. Not exported from any entry point. */
export const TOOLTIP_KEY: InjectionKey<TooltipContextValue> = Symbol('cck-tooltip');

/**
 * The context of the nearest TooltipRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a TooltipRoot.
 */
export function useTooltipContext(part: string): TooltipContextValue {
  const context = inject(TOOLTIP_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <TooltipRoot>.`);
  return context;
}
