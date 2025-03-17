import {
  ChipList as ChipListOriginal,
  Error,
  FormField,
  Hint,
  Label,
  Leading,
  Prefix,
  Suffix,
  SvgIcon,
  Trailing,
} from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const ChipList: StoryObj<typeof FormField> = {
  name: 'ChipList',
  decorators: [
    // withWrapperDecorator({}, {width: '300px'}),
  ],
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
                     import { FormField, Label ,ChipListOriginal } from "@cocokits/react-components";
  
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
                  <SvgIcon icon={YOUR_ICON} />
                </Prefix>
              <% } %>

              <ChipListOriginal
                chips={['Steak', 'Pizza']}
                placeholder="<%= placeholder %>"
                addOnBlur={<%= addOnBlur %>} />

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
                </>
              );
            }
            
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.label('Label'),
        CCK_CONTROL.placeholder('Placeholder'),
        CCK_CONTROL.hint(),
        CCK_CONTROL.error(),
        CCK_CONTROL.leading(),
        CCK_CONTROL.trailing(),
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.prefixIcon(),
        CCK_CONTROL.suffixIcon(),
        CCK_CONTROL.disabled(),
        CCK_CONTROL.required(),
        CCK_CONTROL.hideRequiredMarker(),
        CCK_CONTROL.invalid(),
        CCK_CONTROL.addOnBlur(),
      ],
    },
  },
  render: (args) => {
    return (
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

        <ChipListOriginal
          chips={['Steak', 'Pizza']}
          placeholder={args.cckControl.placeholder}
          addOnBlur={args.cckControl.addOnBlur}
        />

        {args.cckControl.suffixIcon !== 'none' && (
          <Suffix>
            <SvgIcon icon={args.cckIcons[args.cckControl.suffixIcon]} />
          </Suffix>
        )}

        {args.cckControl.trailing && <Trailing>{args.cckControl.trailing}</Trailing>}

        {args.cckControl.hint && <Hint>{args.cckControl.hint}</Hint>}
        {args.cckControl.error && <Error>{args.cckControl.error}</Error>}
      </FormField>
    );
  },
  // render: (args) => ({
  //   props: {
  //     ...args,
  //     chips: ['Steak', 'Pizza', 'Burger'],
  //   },
  //   template: `
  //     <cck-form-field
  //       style="width: 100%;"
  //       [disabled]="cckControl.disabled"
  //       ${ngThemeArgsToTemplate(args)}>

  //       @if(cckControl.label) {
  //         <cck-label>{{cckControl.label}}</cck-label>
  //       }

  //       @if(cckControl.leading) {
  //         <cck-leading>{{cckControl.leading}}</cck-leading>
  //       }

  //       @if(cckControl.prefix !== 'none') {
  //         <cck-prefix>
  //           <cck-svg-icon [icon]="cckIcons[cckControl.prefix]"></cck-svg-icon>
  //         </cck-prefix>
  //       }

  //       <cck-chip-list
  //         [chips]="chips"
  //         placeholder="{{cckControl.placeholder}}"
  //         [addOnBlur]="cckControl.addOnBlur"/>

  //       @if(cckControl.suffix !== 'none') {
  //         <cck-suffix>
  //           <cck-svg-icon [icon]="cckIcons[cckControl.suffix]"></cck-svg-icon>
  //         </cck-suffix>
  //       }

  //       @if(cckControl.trailing) {
  //         <cck-trailing>{{cckControl.trailing}}</cck-trailing>
  //       }

  //       @if(cckControl.hint) {
  //         <cck-hint>{{cckControl.hint}}</cck-hint>
  //       }
  //       @if(cckControl.error) {
  //         <cck-error [force]="true">{{cckControl.error}}</cck-error>
  //       }
  //     </cck-form-field>
  //   `,
  // }),
};
