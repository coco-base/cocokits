import type { Meta } from '@storybook/angular';

import descriptionMd from './svg-icon-description.md';
import { SvgIconListComponent } from './svg-icon-list/svg-icon-list.component';

export { Size } from './svg-icon-size.stories';

const meta: Meta = {
  component: SvgIconListComponent,
  title: 'Components/Icon/SvgIcon',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
};
export default meta;
