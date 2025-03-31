import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { ButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';

export { Default } from './overview/default.stories';
export { Type } from './overview/type.stories';
export { Size } from './overview/size.stories';
export { Color } from './overview/color.stories';

export { BackButton } from './examples/back-button/index.example.stories';
export { CopyLinkButton } from './examples/copy-link-button/index.example.stories';
export { DeleteButton } from './examples/delete-button/index.example.stories';
export { AddNewButton } from './examples/add-new-button/index.example.stories';
export { ShowMoreButton } from './examples/show-more-button/index.example.stories';
export { StackHorizontalButton } from './examples/stack-horizontal-button/index.example.stories';
export { StackVerticalButton } from './examples/stack-vertical-button/index.example.stories';

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
