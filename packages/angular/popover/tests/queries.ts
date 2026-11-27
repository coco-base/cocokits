import { screen } from '@testing-library/angular';

/** Resolves after the next animation frame. */
export const frame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

/** The button that opens the popover. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });
