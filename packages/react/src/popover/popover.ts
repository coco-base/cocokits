import { PopoverAnchor } from './popover-anchor';
import { PopoverArrow } from './popover-arrow';
import { PopoverClose } from './popover-close';
import { PopoverContent } from './popover-content';
import { PopoverDescription } from './popover-description';
import { PopoverRoot } from './popover-root';
import { PopoverTitle } from './popover-title';
import { PopoverTrigger } from './popover-trigger';
import type { ReactElement } from 'react';
import type {
  PopoverAnchorProps,
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverDescriptionProps,
  PopoverPart,
  PopoverRootProps,
  PopoverTitleProps,
  PopoverTriggerProps,
} from './popover.types';

/** The shape of the {@link Popover} namespace. */
interface PopoverNamespace {
  readonly Root: PopoverPart<PopoverRootProps>;
  readonly Trigger: PopoverPart<PopoverTriggerProps>;
  readonly Anchor: PopoverPart<PopoverAnchorProps, ReactElement | null>;
  readonly Content: PopoverPart<PopoverContentProps>;
  readonly Arrow: PopoverPart<PopoverArrowProps>;
  readonly Title: PopoverPart<PopoverTitleProps>;
  readonly Description: PopoverPart<PopoverDescriptionProps>;
  readonly Close: PopoverPart<PopoverCloseProps>;
}

/**
 * The Popover parts as a namespace: `Popover.Root`, `Popover.Trigger`, `Popover.Anchor`, `Popover.Content`, `Popover.Arrow`,
 * `Popover.Title`, `Popover.Description` and `Popover.Close`.
 * A non-modal panel next to a button, for content that holds controls.
 */
export const Popover: PopoverNamespace = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
};
