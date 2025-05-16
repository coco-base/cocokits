import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-box-selection.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { CheckboxBoxSelectionComponent } from './checkbox-box-selection.component';

export const CheckboxBoxSelection: StoryObj = {
  name: 'Checkbox Box Selection',
  decorators: [
    moduleMetadata({
      imports: [CheckboxBoxSelectionComponent],
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
      <cck-checkbox-box-selection [style]="cckExampleCssVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
