import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { TableComponent } from '@cocokits/angular-table';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
// export { Type } from './overview/type.stories';
// export { Size } from './overview/size.stories';
// export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: TableComponent,
  title: 'UI Components/Table',
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
      componentName: 'table',
    },
  },
};
export default meta;
