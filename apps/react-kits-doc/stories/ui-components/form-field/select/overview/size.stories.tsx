import { FormField, Label, Option, Select } from "@cocokits/react-form-field";
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from "@cocokits/storybook-addon-theme";
import { StoryObj } from "@cocokits/storybook-addon-theme-react";

export const Size: StoryObj<typeof Select> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Option, Select } from "@cocokits/react-form-field";

            export const MyComponent = () => {
              return (
                <>
                  <% themeComponentConfig.size.values.map(size => { %>
                    <FormField>
                      <Label>Select - <%= size %></Label>
                      <Select
                        size="<%= size %>"
                        <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
                      >
                        <Option value="Small">Small</Option>
                        <Option value="Medium">Medium</Option>
                        <Option value="Large">Large</Option>
                      </Select>
                    </FormField>
                  <% }) %>
                </>
              );
            }
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <FormField key={index}>
          <Label>Select - {size}</Label>
          <Select size={size}>
            <Option value="Small">Small</Option>
            <Option value="Medium">Medium</Option>
            <Option value="Large">Large</Option>
          </Select>
        </FormField>
      ))}
    </>
  ),
};
