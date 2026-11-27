'use client';

import type { ReactElement } from 'react';
import { useTooltipTextPart } from './use-tooltip-text-part';
import type { TooltipPart, TooltipTextProps } from './tooltip.types';

function TooltipDescriptionImpl(props: TooltipTextProps): ReactElement {
  return useTooltipTextPart('description', props);
}

/**
 * An optional smaller text inside `Tooltip.Content`, after the title. It renders a `<div>` with no role. Its text is
 * part of the tooltip text, so the description of the trigger reads it.
 *
 * @example
 * <Tooltip.Content>
 *   <Tooltip.Title>Copy link</Tooltip.Title>
 *   <Tooltip.Description>Copies the address to the clipboard.</Tooltip.Description>
 * </Tooltip.Content>
 * @cckPart description
 * @param props - The Description props.
 * @returns The rendered div.
 */
export const TooltipDescription: TooltipPart<TooltipTextProps> = Object.assign(TooltipDescriptionImpl, {
  displayName: 'Tooltip.Description',
});
