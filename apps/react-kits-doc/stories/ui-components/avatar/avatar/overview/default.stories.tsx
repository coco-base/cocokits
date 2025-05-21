import { Avatar } from '@cocokits/react-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Avatar> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { Avatar} from '@cocokits/react-components';

            export const MyComponent = () => {
              <% if (placeholderSrc) { %> const placeholder="<%= placeholderSrc %>"; <% } %>
              <% if (fallbackSrc) { %> const fallback="<%= fallbackSrc %>"; <% } %>

              return (
                <Avatar
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                  <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                  <% if (src) { %> src='<%= src %>' <% } %>
                  <% if (alt) { %> alt='<%= alt %>' <% } %>
                  <% if (!src && label) { %> label='<%= label %>' <% } %>
                  <% if (src && placeholderSrc) { %> placeholderSrc={placeholder} <% } %>
                  <% if (src && fallbackSrc) { %> fallbackSrc={fallback} <% } %>
                  <% if (!clickable) { %> clickable={false} <% } %>
                />
              )
            }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.label(''),
        CCK_CONTROL.alt('Image alt'),
        CCK_CONTROL.srcUrl(),
        CCK_CONTROL.placeholderSrc(),
        CCK_CONTROL.fallbackSrc(),
        CCK_CONTROL.clickable(),
        CCK_CONTROL.additional(),
      ],
    },
  },
  args: {},
  render: (args) => (
    <Avatar
      {...reactThemeArgsToTemplate(args)}
      src={args.cckControl.src}
      alt={args.cckControl.alt}
      label={args.cckControl.label}
      placeholderSrc={args.cckControl.placeholderSrc}
      fallbackSrc={args.cckControl.fallbackSrc}
      clickable={args.cckControl.clickable}/>
  ),
};
