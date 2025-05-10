import { FormField, Label, Textarea } from '@cocokits/react-form-field';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const ErrorState: StoryObj<typeof Textarea> = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the Textarea component in an error state, showing a validation message.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: false,
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { FormField, Label, Textarea } from '@cocokits/react-form-field';

          export const MyComponent = () => {
            return (
              <FormField>
                <Label>Textarea</Label>
                <Textarea
                  placeholder="Placeholder"
                  required
                  invalid
                  error="Please type something..."
                />
              </FormField>
            );
          };
          `,
        },
      ],
    },
  },
  render: () => (
    <FormField>
      <Label>Textarea</Label>
      <Textarea
        placeholder="Placeholder"
        required
        invalid
        error="Please type something..."
      />
    </FormField>
  ),
};
