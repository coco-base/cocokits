import { FormField, Label, Option, Select } from "@cocokits/react-form-field";
import { renderWithPageTab, renderWithThemeProp } from "@cocokits/storybook-addon-theme";
import { StoryObj } from "@cocokits/storybook-addon-theme-react";

export const Type: StoryObj<typeof Select> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'The type prop adjusts the visual style of the Select component, allowing for different UI purposes like default, secondary, or ghost.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'),renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Option, Select } from "@cocokits/react-form-field";
    
            export const MyComponent = () => {
              return (
                <>
                  <% themeComponentConfig.type.values.map(type => { %>
                    <FormField>
                      <Label>Select - <%= type %></Label>
                      <Select type="<%= type %>">
                        <Option value="default">default</Option>
                        <Option value="secondary">secondary</Option>
                        <Option value="ghost">ghost</Option>
                      </Select>
                    </FormField>
                  <% }) %>
                </>
              );
            }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <FormField key={index} style={{ marginBottom: '1rem', minWidth: '200px' }}>
          <Label>Select - {type}</Label>
          <Select type={type}>
            <Option value="default">default</Option>
            <Option value="secondary">secondary</Option>
            <Option value="ghost">ghost</Option>
          </Select>
        </FormField>
      ))}
    </>
  ),
};
