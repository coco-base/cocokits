import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-column.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { CheckboxGroupColumnComponent } from './checkbox-group-column.component';

export const CheckboxGroupColumn: StoryObj = {
  name: 'Checkbox Group Column',
  decorators: [
    moduleMetadata({
      imports: [CheckboxGroupColumnComponent],
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
      <cck-checkbox-group-column [style]="cckExampleCssVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
