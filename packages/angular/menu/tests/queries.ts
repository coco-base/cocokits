import { screen } from '@testing-library/angular';

/** Resolves after the next animation frame. */
export const frame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

/** The menu button. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Actions' });

/** An item of the open menu, by its text. */
export const item = (name: string): HTMLElement => screen.getByRole('menuitem', { name });
