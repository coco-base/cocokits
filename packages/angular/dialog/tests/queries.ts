import { screen, waitFor } from '@testing-library/angular';
import { expect } from 'vitest';

/** Resolves after the next animation frame. */
export const frame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

/** The open "Delete project" dialog. */
export const dialog = (): HTMLDialogElement =>
  screen.getByRole<HTMLDialogElement>('dialog', { name: 'Delete project' });

/** Resolves once no dialog is in the document. */
export const closed = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

/** Gives the element a box, so a press can land outside it. */
export const boxAt = (element: HTMLElement): void => {
  element.getBoundingClientRect = () => new DOMRect(100, 100, 200, 200);
};

/** A pointer press that lands on the dialog element, outside its box. */
export const pressBackdrop = (target: HTMLElement, at: { clientX: number; clientY: number }): void => {
  target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, ...at }));
};
