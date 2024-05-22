import { addons } from '@storybook/preview-api';
import { NAVIGATE_URL } from '@storybook/core-events';

export const storyNameToHash = (id: string): string => id.toLowerCase().replace(/[^a-z0-9]/gi, '-');

export const storybookNavigateTo = (url: string) => {
  addons.getChannel().emit(NAVIGATE_URL, url);
};
