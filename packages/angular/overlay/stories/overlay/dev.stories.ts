import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/core';

import { OverlayComponent } from '../../src/components/overlay/overlay.component';

const meta: AngularStoriesMeta = {
  component: OverlayComponent,
  title: 'Dev/Overlay',
  tags: ['!autodocs'],
  decorators: [componentWrapperDecorator((story) => `<div class="flex gap-24">${story}</div>`), moduleMetadata({})],
  argTypes: {},
};

export default meta;

export const Default: AngularStoryObj<OverlayComponent> = {
  args: {
    // color: 'brand',
  },
};
