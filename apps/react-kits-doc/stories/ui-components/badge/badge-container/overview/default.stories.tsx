import { Badge, BadgeContainer } from '@cocokits/react-badge';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof BadgeContainer> = {
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
          import { BadgeContainer, SvgIcon} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <BadgeContainer
                <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                position='<%= position %>'
                <% if (offsetX && offsetY) { %> offset={['<%= offsetX %>', '<%= offsetY %>']}" <% } %>
                <% if (radius) { %> radius='<%= radius %>' <% } %>
              >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: 'var(--cck-doc-color-bg-3, #191b23)',
                    border: '3px solid var(--cck-doc-color-border-3, #ffffff33)',
                    borderRadius: radius || '0',
                  }}></div>
                <Badge
                  <% if (typeof badgeType !== 'undefined') { %> type='<%= badgeType %>' <% } %>
                  <% if (typeof badgeSize !== 'undefined') { %> size='<%= badgeSize %>' <% } %>
                  <% if (typeof badgeColor !== 'undefined') { %> color='<%= badgeColor %>' <% } %>
                  <% if (max > 0) { %> max={<%= max %>} <% } %>
                  <% if (content !== '') { %> content='<%= content %>' <% } %>
                  <% if (hide) { %> hide={<%= hide %>} <% } %>
                />
              </BadgeContainer>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.type('badge'),
        CCK_CONTROL.size('badge'),
        CCK_CONTROL.color('badge'),
        CCK_CONTROL.customSelect('position', ['top-left', 'top-right', 'bottom-left', 'bottom-right'], 'top-right'),
        CCK_CONTROL.customText('Content', '2'),
        CCK_CONTROL.customNumber('Max', 10),
        CCK_CONTROL.customText('Radius', '12px'),
        CCK_CONTROL.customText('OffsetX', undefined),
        CCK_CONTROL.customText('OffsetY', undefined),
        CCK_CONTROL.customBoolean('Hide', false),
      ],
    },
  },
  args: {},
  render: (args) => (
    <BadgeContainer
      {...reactThemeArgsToTemplate(args)}
      position={args.cckControl.position}
      offset={[args.cckControl.offsetX, args.cckControl.offsetY]}
      radius={args.cckControl.radius}>
      <div
        style={{
          width: '70px',
          height: '70px',
          backgroundColor: 'var(--cck-doc-color-bg-3, #191b23)',
          border: '3px solid var(--cck-doc-color-border-3, #ffffff33)',
          borderRadius: args.cckControl.radius || '0',
        }}></div>
      <Badge
        type={args.cckControl.badgeType}
        size={args.cckControl.badgeSize}
        color={args.cckControl.badgeColor}
        content={args.cckControl.content}
        max={args.cckControl.max}
        hide={args.cckControl.hide}
      />
    </BadgeContainer>
  ),
};
