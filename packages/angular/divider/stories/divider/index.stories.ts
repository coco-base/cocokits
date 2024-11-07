import { moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { DividerComponent } from '../../src/lib/divider/divider.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: DividerComponent,
  title: 'UI Components/Divider',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
  argTypes: {
    // Example of: using component API insteadof Theme API or Disable from ArgTable
    // type: { table: { useComponentApi: true, disable: true } },
  },
  args: {},
};
export default meta;
