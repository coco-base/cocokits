import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';
import { withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { DividerComponent } from '../../src/lib/divider/divider.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: DividerComponent,
  title: 'UI Components/Divider',
  decorators: [
    withWrapperDecorator({ direction: 'row', insideBox: true }, { width: '200px', height: '100px' }),
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
      componentName: 'divider',
    },
  },
};
export default meta;
