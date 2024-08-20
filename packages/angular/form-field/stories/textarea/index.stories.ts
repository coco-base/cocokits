import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { UIComponentConfig } from '@cocokits/angular-core';
import { AngularStoriesMeta } from '@cocokits/core';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { TextareaComponent } from '../../src/lib/textarea/textarea.component';

export { Default } from './default.stories';

const meta: AngularStoriesMeta = {
  component: TextareaComponent,
  title: 'UI Components/Textarea',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      providers: [
        {
          provide: UIComponentConfig,
          useValue: getSelectedCckTheme()?.uiComponentConfig,
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
