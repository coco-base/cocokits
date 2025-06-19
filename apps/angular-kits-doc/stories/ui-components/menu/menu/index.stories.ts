import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { ButtonComponent, IconButtonComponent } from '@cocokits/angular-button';
import { _UiBaseComponent } from '@cocokits/angular-core';
import { DividerComponent } from '@cocokits/angular-divider';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { MenuComponent, MenuItemComponent, MenuTriggerDirective } from '@cocokits/angular-menu';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

const meta: StoriesMeta = {
  component: MenuComponent,
  subcomponents: [_UiBaseComponent, MenuItemComponent, MenuTriggerDirective],
  title: 'UI Components/Menu',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [
        IconButtonComponent,
        SvgIconComponent,
        MenuItemComponent,
        MenuTriggerDirective,
        DividerComponent,
        ButtonComponent,
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
      componentName: 'menu',
      subcomponents: {
        MenuItemComponent: {
          name: 'menuItem',
          argsTypes: {
            disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
          },
        },
        MenuTriggerDirective: {
          name: null,
          argsTypes: {
            menuOpen: { table: { defaultValue: { summary: 'false' } } },
            menuSizes: { table: { type: { summary: 'OverlayConfig["size"]' }, defaultValue: { summary: '' } } },
            menuOpened: { table: { category: 'outputs' } },
            menuClosed: { table: { category: 'outputs' } },
          },
        },
      },
    },
  },
  // argTypes: {
  //   _MenuItemComponent: {
  //     disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  //   },
  //   _MenuTriggerDirective: {
  //     menuOpen: { table: { defaultValue: { summary: 'false' } } },
  //     menuSizes: { table: { type: { summary: 'OverlayConfig["size"]' }, defaultValue: { summary: '' } } },
  //     menuOpened: { table: { category: 'outputs' } },
  //     menuClosed: { table: { category: 'outputs' } },
  //   },
  // },
};
export default meta;
