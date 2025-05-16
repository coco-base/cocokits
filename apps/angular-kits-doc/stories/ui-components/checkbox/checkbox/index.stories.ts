import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { CheckboxLabelThrough } from './examples/checkbox-label-through/index.example.stories';
export { CheckboxLabelLink } from './examples/checkbox-label-link/index.example.stories';
export { CheckboxGroupColumn } from './examples/checkbox-group-column/index.example.stories';
export { CheckboxGroupRow } from './examples/checkbox-group-row/index.example.stories';
export { CheckboxBoxSelection } from './examples/checkbox-box-selection/index.example.stories';
export { CheckboxBoxSelectionInfo } from './examples/checkbox-box-selection-info/index.example.stories';

const meta: StoriesMeta = {
  component: CheckboxComponent,
  title: 'UI Components/Checkbox',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'checkbox',
    },
  },
};
export default meta;
