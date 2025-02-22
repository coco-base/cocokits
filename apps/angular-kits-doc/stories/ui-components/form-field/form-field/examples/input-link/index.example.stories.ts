import { moduleMetadata } from '@storybook/angular';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/form-field/input-link.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { InputLinkComponent } from './input-link.component';

export const InputLink: StoryObj = {
  name: 'Input Link',
  decorators: [
    moduleMetadata({
      imports: [InputLinkComponent],
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
      <cck-input-link [style]="cckExampleVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
