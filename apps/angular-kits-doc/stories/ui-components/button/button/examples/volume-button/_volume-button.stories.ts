import { moduleMetadata } from '@storybook/angular';

import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { CSS_VARIABLES, TEMPLATE_ARGS } from './_story.config';
import { SOURCE } from './_story.source';
import { VolumeButtonComponent } from './volume-button.component';

export const VolumeButton: StoryObj = {
  name: 'Volume Button',
  decorators: [
    moduleMetadata({
      imports: [VolumeButtonComponent],
    }),
  ],
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
      exampleStory: {
        templateArgsMap: TEMPLATE_ARGS,
        cssArgsMap: CSS_VARIABLES,
      },
    },
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <cck-volume-button [style]="cckExampleVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
