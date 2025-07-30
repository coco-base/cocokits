import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { TabComponent, TabsComponent } from '@cocokits/angular-tabs';
import {
  ngArgType,
  StoriesMeta,
  withThemeConfigProvider,
  withWrapperDecorator,
} from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import ngTemplateMd from './ng-templates.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';
export { Disabled } from './overview/disabled.stories';
export { CustomHeader } from './overview/custom-header.stories';
export { Control } from './overview/control.stories';

const meta: StoriesMeta = {
  component: TabsComponent,
  title: 'UI Components/Tabs',
  subcomponents: [TabComponent],
  decorators: [
    withWrapperDecorator({ insideBox: true }, { width: '500px' }),
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [TabComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'tabs',
      ngTemplateMarkdown: ngTemplateMd,
      subcomponents: {
        TabComponent: {
          name: 'tab',
          description: 'The Tab component represents a single tab within the Tabs component.',
          argsTypes: {
            ...ngArgType({ name: 'disabled', type: 'boolean', defaultValue: 'false' }),
            ...ngArgType({ name: 'header', type: 'string', defaultValue: '' }),
            ...ngArgType({ name: 'value', type: 'TValue', defaultValue: '' }),
          },
        },
      },
    },
  },
  argTypes: {
    ...ngArgType({ name: 'change', category: 'outputs', type: 'TabSelectionChangeEvent' }),
    ...ngArgType({ name: 'selectedChange', type: 'TValue' }),
    ...ngArgType({ name: 'selectedIndexChange', type: 'number' }),
    ...ngArgType({ name: 'headerAlign', type: `left | center | right | stretch`, defaultValue: 'left' }),
    ...ngArgType({ name: 'hideContent', type: `boolean`, defaultValue: 'false' }),
    ...ngArgType({ name: 'instantAnimation', type: `boolean`, defaultValue: 'false' }),
    ...ngArgType({ name: 'selectedIndex', defaultValue: '0' }),
  },
};
export default meta;
