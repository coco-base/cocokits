import { waitFor } from '@testing-library/angular';
import { expect } from 'vitest';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';

/** The tooltip content element, or null while it is closed. */
export const bubble = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(`.${tooltipAnatomy.classes.content}`);

/** Resolves once the tooltip content is in the document. */
export const opened = (): Promise<void> =>
  waitFor(() => {
    expect(bubble()).not.toBeNull();
  });

/** Resolves once the tooltip content is out of the document. */
export const closed = (): Promise<void> =>
  waitFor(() => {
    expect(bubble()).toBeNull();
  });
