import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { moduleMetadata } from '@storybook/angular';

import { IconButtonComponent } from '@cocokits/angular-button';
import { _UiBaseComponent, ThemeConfigToken } from '@cocokits/angular-core';
import { DividerComponent } from '@cocokits/angular-divider';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { AngularStoriesMeta } from '@cocokits/internal-model';
import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import descriptionMd from './description.md';
import { MenuItemComponent, MenuTriggerDirective } from '../../src';
import { MenuComponent } from '../../src/lib/menu/menu.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
export { Origin } from './origin.stories';
export { ThemeCocokitsItemIconColor } from './theme-cocokits-item-icon.stories';

const meta: AngularStoriesMeta = {
  component: MenuComponent,
  subcomponents: [_UiBaseComponent, MenuItemComponent, MenuTriggerDirective],
  title: 'UI Components/Menu',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        IconButtonComponent,
        SvgIconComponent,
        MenuItemComponent,
        MenuTriggerDirective,
        DividerComponent,
      ],
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getSelectedCckTheme()?.themeConfig,
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
  argTypes: {
    _MenuItemComponent: {
      disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
    },
    _MenuTriggerDirective: {
      menuOpen: { table: { defaultValue: { summary: 'false' } } },
      menuSizes: { table: { type: { summary: 'OverlayConfig["size"]' }, defaultValue: { summary: '' } } },
      menuOpened: { table: { category: 'outputs' } },
      menuClosed: { table: { category: 'outputs' } },
    },
  },
  args: {},
};
export default meta;
