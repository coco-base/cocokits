import { moduleMetadata } from '@storybook/angular';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/button/back-button.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { BackButtonComponent } from './back-button.component';

export const BackButton: StoryObj = {
  name: 'Back Button',
  decorators: [
    moduleMetadata({
      imports: [BackButtonComponent],
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
      <cck-back-button [style]="cckExampleVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
