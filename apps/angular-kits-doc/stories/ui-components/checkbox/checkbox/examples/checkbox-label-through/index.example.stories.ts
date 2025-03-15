import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-through.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { CheckboxLabelThroughComponent } from './checkbox-label-through.component';

export const CheckboxLabelThrough: StoryObj = {
  name: 'Checkbox Label Through',
  decorators: [
    moduleMetadata({
      imports: [CheckboxLabelThroughComponent],
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
      <cck-checkbox-label-through [style]="cckExampleCssVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
