import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';

/** Why the popover opened or closed. */
export type PopoverChangeReason = 'trigger' | 'close' | 'escape' | 'outside-press' | 'focus-out';

/** The side of the trigger the content sits on. `start` and `end` follow the direction. */
export type PopoverSide = OverlaySide;

/** How the content lines up along the trigger's edge. */
export type PopoverAlign = OverlayAlign;

/** Inputs of `getPopoverProps` and `transitionPopover`. */
export interface PopoverState {
  /** The SSR-stable id of the popover, from the adapter. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /**
   * Whether the content is in the document: `open`, or closed with an exit animation still running.
   * @defaultValue the value of `open`
   */
  readonly mounted?: boolean | undefined;
  /** The resolved side, from the adapter's placement state. @defaultValue 'bottom' */
  readonly side?: PopoverSide | undefined;
  /** The resolved alignment, from the adapter's placement state. @defaultValue 'center' */
  readonly align?: PopoverAlign | undefined;
  /** Whether a Title is mounted; the content is labelled by it. @defaultValue false */
  readonly hasTitle?: boolean | undefined;
  /** Whether a Description is mounted; the content is described by it. @defaultValue false */
  readonly hasDescription?: boolean | undefined;
  /**
   * Whether the anchor is fully hidden by its clipping ancestors (the fact the positioning module reports with
   * `hideWhenDetached`); the content is then hidden.
   * @defaultValue false
   */
  readonly anchorHidden?: boolean | undefined;
  /**
   * Whether the content is a modal one: it gets `aria-modal="true"`. The adapter does the rest (inert outside,
   * scroll lock, focus loop).
   * @defaultValue false
   */
  readonly modal?: boolean | undefined;
  /**
   * Whether the content is kept in the document while closed and its exit animation is over (force-mounted):
   * the content is then hidden with the native `hidden` attribute.
   * @defaultValue false
   */
  readonly keptClosed?: boolean | undefined;
  /**
   * Whether the arrow cannot point at the anchor (the content shifted along the edge), as the positioning module
   * reports it: the arrow is then hidden with the native `hidden` attribute.
   * @defaultValue false
   */
  readonly arrowHidden?: boolean | undefined;
}

/** The events the handlers send. */
export type PopoverEvent =
  | { readonly type: 'TRIGGER.CLICK'; readonly event: Event }
  | { readonly type: 'CLOSE.CLICK'; readonly event: Event }
  /** The layer stack asked the popover to close. */
  | {
      readonly type: 'CONTENT.DISMISS';
      readonly reason: 'escape' | 'outside-press' | 'focus-out';
      readonly event: Event | null;
    };

/** The open change the adapter reports (when the model accepts it). */
export interface PopoverTransition {
  /** The requested open state. */
  readonly open: boolean;
  /** Why. */
  readonly reason: PopoverChangeReason;
}

/** The ids of the parts that link to each other. */
export interface PopoverIds {
  /** The trigger id. */
  readonly trigger: string;
  /** The content id. */
  readonly content: string;
  /** The title id. */
  readonly title: string;
  /** The description id. */
  readonly description: string;
}

/** Props shared by every part. */
export interface PopoverPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the trigger. */
export interface PopoverTriggerProps extends PopoverPartProps {
  /** The trigger id. */
  readonly id: string;
  /** Always `'button'`. */
  readonly type: 'button';
  /** Always `'dialog'`. */
  readonly 'aria-haspopup': 'dialog';
  /** The open state, always rendered. */
  readonly 'aria-expanded': 'true' | 'false';
  /** The content id, only while the content is mounted. */
  readonly 'aria-controls'?: string | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Sends `TRIGGER.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
}

/** Props of the content. */
export interface PopoverContentProps extends PopoverPartProps {
  /** The content id. */
  readonly id: string;
  /** Always `'dialog'`. */
  readonly role: 'dialog';
  /** Always `-1`: the content takes focus when it holds nothing focusable. */
  readonly tabIndex: -1;
  /** The title id, only while a Title is mounted. */
  readonly 'aria-labelledby'?: string | undefined;
  /** The description id, only while a Description is mounted. */
  readonly 'aria-describedby'?: string | undefined;
  /** `'true'` with `modal`; otherwise absent. */
  readonly 'aria-modal'?: 'true' | undefined;
  /** `true` while the anchor is hidden or the closed content is kept mounted (native `hidden`); otherwise absent. */
  readonly hidden?: true | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** The resolved side. */
  readonly 'data-side': PopoverSide;
  /** The resolved alignment. */
  readonly 'data-align': PopoverAlign;
}

/** Props of the arrow. */
export interface PopoverArrowProps extends PopoverPartProps {
  /** Always `'true'`: the arrow is decorative. */
  readonly 'aria-hidden': 'true';
  /** `true` while the arrow cannot point at the anchor (native `hidden`); otherwise absent. */
  readonly hidden?: true | undefined;
}

/** Props of the title or the description. */
export interface PopoverTextProps extends PopoverPartProps {
  /** The id the content refers to. */
  readonly id: string;
}

/** Props of the Close part. */
export interface PopoverCloseProps extends PopoverPartProps {
  /** Always `'button'`. */
  readonly type: 'button';
  /** Sends `CLOSE.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
}

/** What `getPopoverProps` returns. The root renders no element, so it has no props. */
export interface PopoverParts {
  /** The trigger props. */
  readonly trigger: PopoverTriggerProps;
  /** The anchor props: its class only. */
  readonly anchor: PopoverPartProps;
  /** The content props. */
  readonly content: PopoverContentProps;
  /** The arrow props. */
  readonly arrow: PopoverArrowProps;
  /** The title props. */
  readonly title: PopoverTextProps;
  /** The description props. */
  readonly description: PopoverTextProps;
  /** The Close props. */
  readonly close: PopoverCloseProps;
}
