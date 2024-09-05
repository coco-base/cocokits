import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { IconButtonComponent } from '@cocokits/angular-button';
import { _UiBaseComponent, UIComponentConfig } from '@cocokits/angular-core';
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
export { ItemIconColor } from './default-theme-item-icon.stories';

const meta: AngularStoriesMeta = {
  component: MenuComponent,
  subcomponents: [_UiBaseComponent, MenuItemComponent, MenuTriggerDirective],
  title: 'UI Components/Menu',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`),
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
          provide: UIComponentConfig,
          useFactory: () => getSelectedCckTheme()?.uiComponentConfig,
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
    // Example of: using component API insteadof Theme API or Disable from ArgTable
    // type: { table: { useComponentApi: true, disable: true } },
  },
  args: {},
};
export default meta;
