import { FormField, Label, Textarea } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const AutoResize: StoryObj<typeof Textarea> = {
  name: 'AutoResize',
  parameters: {
    docs: {
      description: {
        story: 'Automatically adjusts the height of the textarea as text is entered, ensuring optimal visibility and a seamless user input experience.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Textarea } from '@cocokits/react-components';

            export const MyComponent = () => {
              return (
                <FormField>
                  <Label>AutoResize</Label>
                  <Textarea
                    autoResize
                    type="<%= cckControl.type %>"
                    placeholder="Placeholder"
                  />
                </FormField>
              );
            }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <FormField>
      <Label>AutoResize</Label>
      <Textarea
        autoResize
        placeholder="Placeholder"
        type={args.cckControl.type}
      />
    </FormField>
  ),
};
