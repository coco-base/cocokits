import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import {
  AddonParametersControlType,
  ngThemeArgsToTemplate,
  withThemeConfigProvider,
} from '@cocokits/storybook-addon-theme';

import { DividerComponent } from '../../src/lib/divider/divider.component';

const meta: AngularStoriesMeta = {
  component: DividerComponent,
  title: 'Dev/Divider',
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
        component: '',
      },
    },
    cckAddon: {
      componentName: 'divider',
    },
  },
};

export default meta;

export const Dev: AngularStoryObj<DividerComponent> = {
  name: 'Dev',
  parameters: {
    cckAddon: {
      hasControl: true,
      controls: [
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
        logMessage: (...message: string[]) => {
          console.log(...message);
        },
        indeterminate: false,
      },
      template: `
       <cck-divider ${ngThemeArgsToTemplate(args)}></cck-divider>
      `,
    };
  },
};
