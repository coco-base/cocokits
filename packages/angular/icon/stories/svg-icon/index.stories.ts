import { componentWrapperDecorator, Meta } from '@storybook/angular';

import descriptionMd from './svg-icon-description.md';
import { templateIcon } from './template-svg-icon';
import { SvgIconComponent } from '../../src';

export { Default } from './svg-icon-default.stories';
export { Size } from './svg-icon-size.stories';
export { Color } from './svg-icon-color.stories';

const meta: Meta = {
  component: SvgIconComponent,
  title: 'UI Components/SvgIcon',
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`)],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
  args: {
    icon: templateIcon,
  },
};
export default meta;
