import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { RadioButtonComponent } from '../../src/lib/radio/radio.component';

export { Default } from './default.stories';

const meta: AngularStoriesMeta = {
  component: RadioButtonComponent,
  title: 'RadioButton',
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
  argTypes: {},
  args: {},
};
export default meta;
