import { Textarea } from '@cocokits/react-components';
import { StoriesMeta } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { ErrorState } from './overview/error-state.stories';
export { AutoResize } from './overview/autoresize.stories';
export { Color } from './overview/color.stories';
export { Size } from './overview/size.stories';
export { Type } from './overview/type.stories';

const meta: StoriesMeta<typeof Textarea> = {
  component: Textarea,
  title: 'UI Components/Textarea',
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'textarea',
    },
  },
};
export default meta;
