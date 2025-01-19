import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { ButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
export { VolumeButton } from './examples/volume-button/_volume-button.stories';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

export {} from // Example1,
// Example2,
// Example3,
// Example4,
// Example5,
// Example6,
// Example7,
// Example8,
// Example9,
// Example10,
// Example11,
// Example12,
// Example13,
// Example14,
// Example15,
// Example16,
// Example17,
// Example18,
// Example19,
// Example20,
// Example21,
// Example22,
// Example23,
// Example24,
// Example25,
// Example26,
// Example27,
// Example28,
// Example29,
// Example30,
// Example31,
// Example32,
// Example33,
// Example34,
// Example35,
// Example36,
// Example37,
// Example38,
// Example39,
// Example40,
// Example41,
// Example42,
// Example43,
// Example44,
// Example45,
// Example46,
// Example47,
// Example48,
// Example49,
// Example50,
// Example51,
// Example52,
// Example53,
// Example54,
// Example55,
// Example56,
// Example57,
// Example58,
// Example59,
// Example60,
// Example61,
// Example62,
// Example63,
// Example64,
// Example65,
// Example66,
// Example67,
// Example68,
// Example69,
// Example70,
// Example71,
// Example72,
// Example73,
// Example74,
// Example75,
// Example76,
// Example77,
// Example78,
// Example79,
// Example80,
'./examples/example.stories';

const meta: StoriesMeta = {
  component: ButtonComponent,
  title: 'UI Components/Button',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [SvgIconComponent],
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
};
export default meta;
