import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/form-field/leading-website.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { LeadingWebsiteComponent } from './leading-website.component';

export const LeadingWebsite: StoryObj = {
  name: 'Leading Website',
  decorators: [
    moduleMetadata({
      imports: [LeadingWebsiteComponent],
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
      <cck-leading-website [style]="cckExampleVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
