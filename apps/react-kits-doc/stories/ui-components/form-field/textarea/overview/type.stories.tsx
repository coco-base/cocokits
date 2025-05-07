/* eslint-disable react/jsx-no-duplicate-props */
import { FormField, Label, Textarea } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Textarea> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp("type"), renderWithPageTab('Overview')],
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
                  <% themeComponentConfig.type.values.map(type => { %>
                    <FormField>
                      <Label>Textarea - <%= type %></Label>
                      <Textarea
                        autoResize
                        type="<%= type %>"
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
      {console.log(args.cckControl.themeComponentConfig.type)}
      {args.cckControl.themeComponentConfig.type?.values.map((value, index) => (
        <FormField key={index}>
          <Label>Textarea - {value}</Label>
          <Textarea
            autoResize
            type={value}
            placeholder="Placeholder"
          />
        </FormField>
      ))}
    </>
  )
};
