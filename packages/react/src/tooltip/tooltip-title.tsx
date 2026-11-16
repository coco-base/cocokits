'use client';

import type { ReactElement } from 'react';
import { useTooltipTextPart } from './use-tooltip-text-part';
import type { TooltipPart, TooltipTextProps } from './tooltip.types';

function TooltipTitleImpl(props: TooltipTextProps): ReactElement {
  return useTooltipTextPart('title', props);
}

/**
 * An optional first line inside `Tooltip.Content`. It renders a `<div>` with no role. Its text is part of the
 * tooltip text, so the description of the trigger reads it, then the description.
 *
 * Put the title first, then `Tooltip.Description`. A tooltip that has these parts, instead of plain text, describes
 * its trigger while it is shown, through the content itself.
 *
 * @example
 * <Tooltip.Content>
 *   <Tooltip.Title>Copy link</Tooltip.Title>
 *   <Tooltip.Description>Copies the address to the clipboard.</Tooltip.Description>
 * </Tooltip.Content>
 * @cckPart title
 * @param props - The Title props.
 * @returns The rendered div.
 */
export const TooltipTitle: TooltipPart<TooltipTextProps> = Object.assign(TooltipTitleImpl, {
  displayName: 'Tooltip.Title',
});
