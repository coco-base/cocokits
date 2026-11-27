import { screen } from '@testing-library/angular';

/** The tab with the accessible name. */
export const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });

/** The text of every tab. */
export const labels = (): string[] => screen.getAllByRole('tab').map((element) => element.textContent.trim());
