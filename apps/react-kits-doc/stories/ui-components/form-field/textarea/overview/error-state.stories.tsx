import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const ErrorState: StoryObj<typeof Textarea> = {
  name: 'Error State',
  parameters: {
    docs: {
      description: {
        story:
          'This demonstrates the textarea in an error state, typically used to indicate invalid input.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { FormField, Label, Textarea } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <FormField invalid>
                <Label>Error State</Label>
                <Textarea invalid placeholder="placeholder" />
              </FormField>
            );
          }
          `,
        },
      ],
    },
  },
  render: () => (
    <FormField invalid>
      <Label>Error State</Label>
      <Textarea invalid placeholder="placeholder" />
    </FormField>
  ),
}; 