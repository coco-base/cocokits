import { applicationConfig, moduleMetadata } from '@storybook/angular';

import {
  AccordionComponent,
  AccordionHeaderComponent,
  AccordionHeaderIconTemplateDirective,
  AccordionPanelComponent,
} from '@cocokits/angular-accordion';
import { IconButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider, withWrapperDecorator } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import ngTemplateMd from './ng-templates.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Disabled } from './overview/disabled.stories';
export { CustomIcon } from './overview/custom-icon.stories';
export { Nested } from './overview/nested.stories';
export { Control } from './overview/control.stories';

const meta: StoriesMeta = {
  component: AccordionComponent,
  title: 'UI Components/Accordion',
  subcomponents: [AccordionPanelComponent, AccordionHeaderComponent],
  decorators: [
    withWrapperDecorator({ insideBox: true }, { width: '400px' }),
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [
        IconButtonComponent,
        SvgIconComponent,
        AccordionPanelComponent,
        AccordionHeaderComponent,
        AccordionHeaderIconTemplateDirective,
      ],
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
      ngTemplateMarkdown: ngTemplateMd,
      subcomponents: {
        AccordionPanelComponent: {
          name: 'accordionPanel',
          description:
            'A collapsible section inside an accordion. Each panel works independently but syncs with the parent for state tracking and expansion logic.',
          argsTypes: {
            value: {
              table: {
                type: { summary: 'TValue[] | TValue' },
                defaultValue: { summary: 'A unique ID is generated automatically' },
              },
            },
            disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
          },
        },
        AccordionHeaderComponent: {
          name: 'accordionHeader',
          description:
            'Acts as the toggle button for the panel. It can be styled or fully replaced using custom children, enabling full flexibility in the header’s layout and content.',
        },
      },
    },
  },
  argTypes: {
    expanded: { table: { type: { summary: 'TValue[] | TValue' }, defaultValue: { summary: '' } } },
    expandedChange: { table: { category: 'outputs', type: { summary: 'TValue[] | TValue' } } },
    iconPosition: { table: { type: { summary: 'left | right' }, defaultValue: { summary: 'right' } } },
    toggleTrigger: { table: { type: { summary: 'header | icon' }, defaultValue: { summary: 'header' } } },
  },
};
export default meta;
