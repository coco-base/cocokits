import { FormField, Label, Option, Select } from "@cocokits/react-form-field";
import { renderWithPageTab } from "@cocokits/storybook-addon-theme";
import { StoryObj } from "@cocokits/storybook-addon-theme-react";

export const ErrorState: StoryObj<typeof Select> = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the Select component in an error state, showing a validation message.',
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
import { FormField, Label, Option, Select } from "@cocokits/react-form-field";

export const MyComponent = () => {
  return (
    <FormField style={{ minWidth: '250px' }}>
      <Label>Choose Your Favorite Food</Label>
      <Select
        placeholder="..."
        required
        invalid
        error="Please choose one option"
      >
        <Option value="Steak">Steak</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
      </Select>
    </FormField>
  );
};
          `,
        },
      ],
    },
  },
  render: () => (
    <FormField style={{ minWidth: '250px' }}>
      <Label>Choose Your Favorite Food</Label>
      <Select
        placeholder="..."
        required
        invalid
        error="Please choose one option"
      >
        <Option value="Steak">Steak</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
      </Select>
    </FormField>
  ),
};
