import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AccordionComponent, AccordionHeaderComponent, AccordionPanelComponent } from '@cocokits/angular-accordion';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: AccordionComponent,
  title: 'UI Components/Accordion',
  tags: ['status:new'],
  subcomponents: [AccordionPanelComponent, AccordionHeaderComponent],
  decorators: [
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
      componentName: 'accordion',
      subcomponents: {
        AccordionPanelComponent: {
          name: 'accordionPanel',
          description:
            'A collapsible section inside an accordion. Each panel works independently but syncs with the parent for state tracking and expansion logic.',
        },
        AccordionHeaderComponent: {
          name: 'accordionHeader',
          description:
            'Acts as the toggle button for the panel. It can be styled or fully replaced using custom children, enabling full flexibility in the header’s layout and content.',
        },
      },
    },
  },
};
export default meta;
