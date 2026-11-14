import { inject, type ComputedRef, type InjectionKey, type ShallowRef, type ComponentPublicInstance } from 'vue';
import type { OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { PopoverEvent } from '@cocokits/machines/popover';

/** What a PopoverRoot gives its parts. */
export interface PopoverContextValue {
  /** The id the part ids derive from (`useId()` of the root). */
  readonly id: string;
  /** Whether the popover is open. */
  readonly open: ComputedRef<boolean>;
  /** Whether the popover is modal: the content makes everything outside inert while it is open. */
  readonly modal: ComputedRef<boolean>;
  /** Whether the content is in the document: open, or closed with its exit animation still running. */
  readonly mounted: ShallowRef<boolean>;
  /** How many PopoverTitles are mounted; the content is labelled by the title while there is one. */
  readonly titles: ShallowRef<number>;
  /** How many PopoverDescriptions are mounted. */
  readonly descriptions: ShallowRef<number>;
  /** What the last mounted PopoverAnchor places the content against; `null` without an anchor. */
  readonly anchor: ShallowRef<Element | OverlayVirtualAnchor | null>;
  /** The trigger element; `null` until the trigger mounted. */
  readonly triggerElement: ShallowRef<HTMLElement | null>;
  /** Makes the element of this trigger instance the live `triggerElement`; `null` on unmount. */
  readonly followTrigger: (instance: ComponentPublicInstance | null) => void;
  /** The content element; `null` while it is not rendered. */
  readonly contentElement: ShallowRef<HTMLElement | null>;
  /** The arrow element; `null` without an arrow. */
  readonly arrowElement: ShallowRef<HTMLElement | null>;
  /** Whether the arrow cannot point at the anchor, as the positioning reports it. */
  readonly arrowHidden: ShallowRef<boolean>;
  /** Hands an event of a part to the machine and applies the change it accepts. */
  readonly send: (event: PopoverEvent) => void;
}

/** Injection key of the popover context. Not exported from any entry point. */
export const POPOVER_KEY: InjectionKey<PopoverContextValue> = Symbol('cck-popover');

/**
 * The context of the nearest PopoverRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a PopoverRoot.
 */
export function usePopoverContext(part: string): PopoverContextValue {
  const context = inject(POPOVER_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <PopoverRoot>.`);
  return context;
}
