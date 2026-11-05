import { tooltipAnatomy } from '@cocokits/machines/tooltip';

/** The tooltip content element, or null while it is closed. */
export const bubble = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(`.${tooltipAnatomy.classes.content}`);
