import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { getInstance } from '@cocokits/common-utils';
import { UIBaseComponentsName } from '@cocokits/core';
import { AngularStoriesMeta } from '@cocokits/internal-model';

// import { getSelectedCckTheme } from '@cocokits/storybook-theme-switcher';
import descriptionMd from './description.md';
import { ThemeEvent } from '../../../../internal/storybook-addon-theme/src/lib/data-access/theme-event/preview-theme-event';
import { ButtonComponent } from '../../src/lib/button/button.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';

const meta: AngularStoriesMeta = {
  component: ButtonComponent,
  title: 'UI Components/Button',
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="story-decorator-wrapper">${story}</div>`),
    moduleMetadata({
      providers: [
        {
          provide: ThemeConfigToken,
          useFactory: () => getInstance(ThemeEvent).getCurrentTheme().themeConfig,
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
    cckAddon: {
      componentName: 'button',
    },
  },
  argTypes: {
    cckControl: { control: 'object' },
  },
};
export default meta;
