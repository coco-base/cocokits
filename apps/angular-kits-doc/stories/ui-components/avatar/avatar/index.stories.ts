import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AvatarComponent, AvatarTemplateDirective } from '@cocokits/angular-avatar';
import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

import descriptionMd from './description.md';
import ngTemplateMd from './ng-templates.md';

export { Default } from './overview/default.stories';
export { CustomTemplate } from './overview/custom-content.stories';

const meta: StoriesMeta = {
  component: AvatarComponent,
  title: 'UI Components/Avatar',
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [AvatarTemplateDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'avatar',
      ngTemplateMarkdown: ngTemplateMd,
    },
  },

  argTypes: {
    src: { table: { type: { summary: 'string' } } },
    alt: { table: { type: { summary: 'string' } } },
    fallbackSrc: { table: { type: { summary: 'string' } } },
    placeholderSrc: { table: { type: { summary: 'string' } } },
    label: { table: { type: { summary: 'string' } } },
    clickable: { table: { type: { summary: 'string' } } },
  },
};
export default meta;
