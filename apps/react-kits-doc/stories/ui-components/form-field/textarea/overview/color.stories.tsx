import { FormField, Label, Textarea } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Textarea> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp("color"), renderWithPageTab('Overview')],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Textarea } from "@cocokits/react-form-field";

            export const MyComponent = () => {
              return (
                <>
                  <% themeComponentConfig.color.values.map(color => { %>
                    <FormField>
                      <Label>Textarea - <%= color %></Label>
                      <Textarea
                        autoResize
                        color="<%= color %>"
                        <% if (typeof cckControl !== 'undefined' && cckControl.type) { %>type="<%= cckControl.type %>"<% } %>
                        placeholder="Placeholder"
                      />
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
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <FormField key={index}>
          <Label>Textarea - {color}</Label>
          <Textarea
            autoResize
            color={color}
            type={args.cckControl.type}
            placeholder="Placeholder"
          />
        </FormField>
      ))}
    </>
  )
};
