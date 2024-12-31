import { moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta, AngularStoryObj } from '@cocokits/internal-model';
import {
  AddonParametersControlType,
  ngThemeArgsToTemplate,
  withThemeConfigProvider,
} from '@cocokits/storybook-addon-theme';

import descriptionMd from './description.md';
import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

const meta: AngularStoriesMeta = {
  component: CheckboxComponent,
  title: 'Dev/Checkbox',
  decorators: [
    moduleMetadata({
      imports: [],
      providers: [withThemeConfigProvider()],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: '',
      },
    },
    cckAddon: {
      componentName: 'checkbox',
    },
  },
};
export default meta;

export const Dev: AngularStoryObj<CheckboxComponent> = {
  name: 'Dev',
  parameters: {
    cckAddon: {
      hasControl: true,
      controls: [
        { displayName: 'Checked', default: false, storyArgKey: 'checked', type: AddonParametersControlType.Boolean },
        {
          displayName: 'Indeterminate',
          default: false,
          storyArgKey: 'indeterminate',
          type: AddonParametersControlType.Boolean,
        },
        { displayName: 'Text', default: 'Checkbox Label', storyArgKey: 'text', type: AddonParametersControlType.Text },
        { displayName: 'Id', default: 'CUSTOM_ID', storyArgKey: 'id', type: AddonParametersControlType.Text },
        { displayName: 'Name', default: 'CUSTOM_NAME', storyArgKey: 'name', type: AddonParametersControlType.Text },
        { displayName: 'Value', default: 'CUSTOM_VALUE', storyArgKey: 'value', type: AddonParametersControlType.Text },
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
        <!-- <button (click)="indeterminate = !indeterminate">Indeterminate</button> -->
        <cck-checkbox
          [checked]="cckControl.checked"
          [indeterminate]="cckControl.indeterminate"
          [id]="cckControl.id"
          [name]="cckControl.name"
          [value]="cckControl.value"
          ${ngThemeArgsToTemplate(args)}
          (change)="logMessage('Checkbox Changed', $event)"
          (indeterminateChange)="logMessage('Checkbox Indeterminate Changed', $event)"
        >
          {{cckControl.text}}
        </cck-checkbox>
      `,
    };
  },
};
