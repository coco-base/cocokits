import { Error,FormField, Hint, Input as InputOriginal, Label, Leading, Prefix, Suffix, Trailing } from '@cocokits/react-form-field';
import { SvgIcon } from '@cocokits/react-icon';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Input: StoryObj<typeof FormField> = {
  name: 'Input',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            <FormField
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
              <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
              <% if (disabled) { %> disabled <% } %>
              <% if (required) { %> required <% } %>
              <% if (invalid) { %> invalid <% } %>
              <% if (hideRequiredMarker) { %> hideRequiredMarker <% } %>
            >

              <% if (label) { %>
                <Label><%= label %></Label>
              <% } %>
              <% if (leading) { %>
                <Leading><%= leading %></Leading>
              <% } %>
              <% if (prefixIcon !== 'none') { %>
                <Prefix>
                  <SvgIcon icon={YOUR_ICON} />
                </Prefix>
              <% } %>

              <Input
                <% if (placeholder) { %> placeholder="<%= placeholder %>" <% } %>
              />

               <% if (trailing) { %>
                <Trailing><%= trailing %></Trailing>
              <% } %>
              <% if (suffixIcon !== 'none') { %>
                <Suffix>
                  <SvgIcon icon={YOUR_ICON} />
                </Suffix>
              <% } %>

              <% if (hint) { %>
                <Hint><%= hint %></Hint>
              <% } %>

              <% if (error) { %>
                <Error><%= error %></Error>
              <% } %>

            </FormField>
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label(),
        CCK_CONTROL.placeholder(),
        CCK_CONTROL.hint(),
        CCK_CONTROL.error(),
        CCK_CONTROL.prefixIcon(),
        CCK_CONTROL.suffixIcon(),
        CCK_CONTROL.leading(),
        CCK_CONTROL.trailing(),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.required(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.invalid(),
        CCK_CONTROL.hideRequiredMarker(),
      ],
    },
  },
  render: (args) => {
    return (
      <FormField
        {...reactThemeArgsToTemplate(args)}
        disabled={args.cckControl.disabled}
        required={args.cckControl.required}
        invalid={args.cckControl.invalid}
        hideRequiredMarker={args.cckControl.hideRequiredMarker}
      >
  
        { args.cckControl.label && <Label>{args.cckControl.label}</Label> }
        { args.cckControl.leading && <Leading>{args.cckControl.leading}</Leading> }
        {
          args.cckControl.prefixIcon !== 'none' &&
          <Prefix>
            <SvgIcon icon={args.cckIcons[args.cckControl.prefixIcon]} />
          </Prefix>
        }
  
        <InputOriginal placeholder={args.cckControl.placeholder}/>
  
        {
          args.cckControl.suffixIcon !== 'none' &&
          <Suffix>
            <SvgIcon icon={args.cckIcons[args.cckControl.suffixIcon]} />
          </Suffix>
        }
  
        { args.cckControl.trailing && <Trailing>{args.cckControl.trailing}</Trailing> }
  
        { args.cckControl.hint && <Hint>{args.cckControl.hint}</Hint> }
        { args.cckControl.error && <Error>{args.cckControl.error}</Error> }
  
      </FormField>
    );
  }
};


