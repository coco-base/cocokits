import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/form-field/suffix-card-pattern.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { SuffixCardPatternComponent } from './suffix-card-pattern.component';

export const SuffixCardPattern: StoryObj = {
  name: 'Suffix Card Pattern',
  decorators: [
    moduleMetadata({
      imports: [SuffixCardPatternComponent],
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
      <cck-suffix-card-pattern [style]="cckExampleCssVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
