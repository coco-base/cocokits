import { Accordion, AccordionHeader,AccordionPanel } from '@cocokits/react-accordion';
import { StoriesMeta, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import descriptionMd from './description.md?raw';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Disabled } from './overview/disabled.stories';
export { CustomIcon } from './overview/custom-icon.stories';
export { Nested } from './overview/nested.stories';
export { Control } from './overview/control.stories';

const meta: StoriesMeta<typeof Accordion> = {
  component: Accordion,
  title: 'UI Components/Accordion',
  subcomponents: {
    AccordionPanel,
    AccordionHeader
  },
  decorators: [
    withWrapperDecorator({ insideBox: true }, { width: '400px' }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'accordion',
      subcomponents: {
        AccordionPanel: {
          name: 'accordionPanel',
          description: 'A collapsible section inside an accordion. Each panel works independently but syncs with the parent for state tracking and expansion logic.',
        },
        AccordionHeader: {
          name: 'accordionHeader',
          description: 'Acts as the toggle button for the panel. It can be styled or fully replaced using custom children, enabling full flexibility in the header’s layout and content.',
        },
      }
    },
  },
  argTypes: {},
};
export default meta;
