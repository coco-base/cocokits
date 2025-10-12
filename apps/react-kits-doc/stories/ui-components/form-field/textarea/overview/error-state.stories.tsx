import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const ErrorState: StoryObj<typeof Textarea> = {
  name: 'Error State',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates both normal and error states for the textarea component.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { FormField, Label, Textarea, Text } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <FormField>
                  <Label>Normal</Label>
                  <Textarea placeholder="placeholder" />
                </FormField>

                <FormField invalid>
                  <Label>Error State</Label>
                  <Textarea invalid placeholder="placeholder" />
                </FormField>
              </>
            );
          };
          `,
        },
      ],
    },
  },
  render: () => (
    <>
      <FormField>
        <Label>Normal</Label>
        <Textarea placeholder="placeholder" />
      </FormField>

      <FormField invalid>
        <Label>Error State</Label>
        <Textarea invalid placeholder="placeholder" />
      </FormField>
    </>
  ),
};
