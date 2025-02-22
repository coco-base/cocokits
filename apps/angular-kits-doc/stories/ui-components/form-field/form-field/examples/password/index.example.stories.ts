import { moduleMetadata } from '@storybook/angular';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/input/password.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { PasswordComponent } from './password.component';

export const Password: StoryObj = {
  name: 'Password',
  decorators: [
    moduleMetadata({
      imports: [PasswordComponent],
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
      <cck-password [style]="cckExampleVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
