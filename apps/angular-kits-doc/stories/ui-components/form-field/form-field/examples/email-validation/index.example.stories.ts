import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/form-field/email-validation.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { EmailValidationComponent } from './email-validation.component';

export const EmailValidation: StoryObj = {
  name: 'Email Validation',
  decorators: [
    moduleMetadata({
      imports: [EmailValidationComponent],
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
      <cck-email-validation [style]="cckExampleVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
