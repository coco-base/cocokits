import { FormField, Input, Label } from "@cocokits/react-form-field";
import { renderWithPageTab } from "@cocokits/storybook-addon-theme";
import { reactThemeArgsToTemplate, StoryObj } from "@cocokits/storybook-addon-theme-react";

export const ErrorState: StoryObj<typeof Input> = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the Input component in an error state, showing a validation message.',
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
import { FormField, Input, Label } from "@cocokits/react-components";

export const MyComponent = () => {
  return (
    <FormField style={{ minWidth: '250px' }}>
      <Label>Email Address</Label>
      <Input
        placeholder="Enter your email"
        required
        invalid
        error="Email is required"
      />
    </FormField>
  );
};
          `,
        },
      ],
    },
  },
  render: (args) => (
    <FormField style={{ minWidth: '250px' }}>{args.cckControl.label && <Label>{args.cckControl.label}</Label>}
      <Input
        {...reactThemeArgsToTemplate(args)}
        placeholder={args.cckControl.placeholder}
        required
        invalid
        error="Email is required"
      />
    </FormField>
  ),
};
