import { FormField, Label, Textarea } from '@cocokits/react-form-field';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Size: StoryObj<typeof Textarea> = {
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
                  <% themeComponentConfig.size.values.map(size => { %>
                    <FormField>
                      <Label>Textarea - <%= size %></Label>
                      <Textarea
                        <% if (typeof cckControl !== 'undefined' && cckControl.type) { %>type="<%= cckControl.type %>"<% } %>
                        size="<%= size %>"
                        placeholder="Write something..."
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
      {args.cckControl.themeComponentConfig.size?.values.map((size, index) => (
        <FormField key={index}>
          <Label>Textarea - {size}</Label>
          <Textarea
            size={size}
            type={args.cckControl.type}
            placeholder="Write something..."
          />
        </FormField>
      ))}
    </>
  )
};
