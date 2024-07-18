import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { CheckboxIndeterminateComponent } from './components/checkbox-indeterminate/checkbox-indeterminate.component';
import descriptionMd from './description.md';
import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export { Default } from './default.stories';
export { Indeterminate } from './indeterminate.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: CheckboxComponent,
  title: 'UI Components/Checkbox',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
    moduleMetadata({
      imports: [CheckboxIndeterminateComponent],
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
