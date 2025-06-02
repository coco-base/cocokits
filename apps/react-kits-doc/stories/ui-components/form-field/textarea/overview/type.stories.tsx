import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Textarea> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story: 'This demonstrates the different type variations of the textarea to match various design contexts.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
              import { FormField, Label, Textarea } from "@cocokits/react-components";

              export const MyComponent = () => {
                return (
                  <>
                    <% themeComponentConfig.type.values.map(type => { %>
                      <FormField>
                        <Label><%= type %></Label>
                        <Textarea
                          <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                          type='<%= type %>'
                        >
                          <%= type %>
                        </Textarea>
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
      {(args.cckControl?.themeComponentConfig?.type?.values || []).map((type, index) => (
        <FormField key={index}>
          <Label>{String(type)}</Label>
          <Textarea
            {...reactThemeArgsToTemplate(args)}
            type={String(type)}
            placeholder={String(type)}
            required={args.cckControl.required}
            disabled={args.cckControl.disabled}
            invalid={args.cckControl.invalid}
            autoResize={args.cckControl.autoResize}
            minRows={args.cckControl.minRows}
            maxRows={args.cckControl.maxRows}
          />
        </FormField>
      ))}
    </>
  ),
};
