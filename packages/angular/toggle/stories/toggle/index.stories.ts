import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import { ToggleComponent } from '../../src/lib/toggle/toggle.component';

export { Default } from './default.stories';
export { Type } from './type.stories';
export { Size } from './size.stories';
export { Color } from './color.stories';
// export { ThemeCocokitsBox } from './theme-cocokits-box.stories';
// export { NgModel } from './ng-model.stories';
// export { ReactiveForm } from './reactive-form.stories';

const meta: StoriesMeta = {
  component: ToggleComponent,
  subcomponents: [_UiBaseComponent],
  title: 'UI Components/Toggle',
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
      componentName: 'toggle',
    },
  },
  argTypes: {
    _disabled: { table: { type: { summary: 'boolean' }, defaultValue: { summary: '' } } },
  },
};
export default meta;
