import type { Meta } from '@storybook/angular';

import descriptionMd from './svg-icon-description.md';
import { SvgIconComponent } from '../../src';

export { Default } from './svg-icon-size.stories';
export { SizeMedium } from './svg-icon-size-medium.stories';
export { SizeSmall } from './svg-icon-size-small.stories';
export { SizeLarge } from './svg-icon-size-large.stories';

const meta: Meta = {
  component: SvgIconComponent,
  title: 'Components/Icon/SvgIcon',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
};
export default meta;
