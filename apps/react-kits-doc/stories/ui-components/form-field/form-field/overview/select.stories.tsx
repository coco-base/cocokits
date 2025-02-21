import {
  Error,
  FormField,
  Hint,
  Label,
  Leading,
  Option,
  Prefix,
  Select as SelectOriginal,
  Suffix,
  Trailing,
} from '@cocokits/react-form-field';
import { SvgIcon } from '@cocokits/react-icon';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Select: StoryObj<typeof FormField> = {
  name: 'Select',
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
          
           import { FormField, Label, Select , Option } from "@cocokits/react-components";
  
            export const MyComponent = () => {
              return (
                <>
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
                      <SvgIcon icon="YOUR_ICON"/>
                  </Prefix>
              <% } %>

              <Select
                  placeholder="<%= placeholder %>"
                  <% if (multiple) { %> multiple={true} <% } %>
              >
                  <Option value="Steak">Steak</Option>
                  <Option value="Pizza">Pizza</Option>
                  <Option value="Burger">Burger</Option>
              </Select>

              <% if (suffixIcon !== 'none') { %>
                  <Suffix>
                      <SvgIcon icon="YOUR_ICON"/>
                  </Suffix>
              <% } %>

              <% if (trailing) { %>
                  <Trailing><%= trailing %></Trailing>
              <% } %>

              <% if (hint) { %>
                  <Hint><%= hint %></Hint>
              <% } %>

              <% if (error) { %>
                  <Error><%= error %></Error>
              <% } %>
          </FormField>
                </>
              );
            }
            
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
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(),
        CCK_CONTROL.multiple(),
        CCK_CONTROL.invalid(),
        CCK_CONTROL.hideRequiredMarker(),
      ],
    },
  },
  render: (args) => (
    <FormField
      style={{ minWidth: '200px' }}
      {...reactThemeArgsToTemplate(args)}
      disabled={args.cckControl.disabled}
      required={args.cckControl.required}
      invalid={args.cckControl.invalid}
      hideRequiredMarker={args.cckControl.hideRequiredMarker}>
      {args.cckControl.label && <Label>{args.cckControl.label}</Label>}
      {args.cckControl.leading && <Leading>{args.cckControl.leading}</Leading>}
      {args.cckControl.prefixIcon !== 'none' && (
        <Prefix>
          <SvgIcon icon={args.cckIcons[args.cckControl.prefixIcon]} />
        </Prefix>
      )}

      <SelectOriginal placeholder={args.cckControl.placeholder} multiple={args.cckControl.multiple}>
        <Option value="Steak">Steak</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
      </SelectOriginal>

      {args.cckControl.suffixIcon !== 'none' && (
        <Suffix>
          <SvgIcon icon={args.cckIcons[args.cckControl.suffixIcon]} />
        </Suffix>
      )}

      {args.cckControl.trailing && <Trailing>{args.cckControl.trailing}</Trailing>}

      {args.cckControl.hint && <Hint>{args.cckControl.hint}</Hint>}
      {args.cckControl.error && <Error>{args.cckControl.error}</Error>}
    </FormField>
  ),
};
