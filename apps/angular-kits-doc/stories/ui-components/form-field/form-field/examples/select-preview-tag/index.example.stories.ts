import { moduleMetadata } from '@storybook/angular';

import {
  CSS_VARIABLES,
  TEMPLATE_ARGS,
} from '@cocokits/common-kits-doc/examples-config/form-field/select-preview-tag.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { SOURCE } from './_story.source';
import { SelectPreviewTagComponent } from './select-preview-tag.component';

export const SelectPreviewTag: StoryObj = {
  name: 'Select Preview Tag',
  decorators: [
    moduleMetadata({
      imports: [SelectPreviewTagComponent],
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
      <cck-select-preview-tag [style]="cckExampleCssVariables" [cckExampleArgs]="cckExampleArgs"/>
    `,
  }),
};
