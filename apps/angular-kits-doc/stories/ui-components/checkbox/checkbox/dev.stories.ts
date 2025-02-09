import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { AddonParametersControlType, CCK_CONTROL } from '@cocokits/storybook-addon-theme';
import {
  ngThemeArgsToTemplate,
  StoriesMeta,
  StoryObj,
  withThemeConfigProvider,
} from '@cocokits/storybook-addon-theme-angular';

const meta: StoriesMeta = {
  component: CheckboxComponent,
  title: 'Dev/Checkbox',
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
      componentName: 'checkbox',
    },
  },
};
export default meta;

export const Dev: StoryObj<CheckboxComponent> = {
  name: 'Dev',
  parameters: {
    docs: {
      description: {
        story: '',
      },
    },
    cckAddon: {
      hasControl: true,
      controls: [
        CCK_CONTROL.checked(false),
        CCK_CONTROL.indeterminate(false),
        CCK_CONTROL.text('Checkbox Label'),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        { displayName: 'Id', default: 'CUSTOM_ID', storyArgKey: 'id', type: AddonParametersControlType.Text },
        { displayName: 'Name', default: 'CUSTOM_NAME', storyArgKey: 'name', type: AddonParametersControlType.Text },
        { displayName: 'Value', default: 'CUSTOM_VALUE', storyArgKey: 'value', type: AddonParametersControlType.Text },
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
        logMessage: (...message: string[]) => {
          // eslint-disable-next-line no-console
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
