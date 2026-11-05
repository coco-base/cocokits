import { screen } from '@testing-library/angular';

/** The tab with the accessible name. */
export const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });
