import { SvgIcon } from '@cocokits/react-icon';
import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const CustomHeader: StoryObj<typeof Tabs> = {
  name: 'CustomHeader',
  parameters: {
    docs: {
      description: {
        story: 'Custom headers allow for personalized tab headers, enhancing user experience and branding.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Tabs, Tab } from "@cocokits/react-components";
          import { Icons } from "@cocokits/common-icons";
          import styled from "styled-components";

          const StyledHeader = styled.div\`
            display: flex;
            gap: 4px;
          \`

          export const MyComponent = () => {
            return (
              <Tabs type="<%= type %>" hideContent={true}>
                <Tab
                  header={() => (
                    <StyledHeader>
                      <SvgIcon icon={Icons.diamonds} />
                      <span>Dashboard</span>
                    </StyledHeader>
                  )}
                />
                <Tab
                  header={() => (
                    <StyledHeader>
                      <SvgIcon icon={Icons.tools} />
                      <span>Tools</span>
                    </StyledHeader>
                  )}
                />
                <Tab
                  header={() => (
                    <StyledHeader>
                      <SvgIcon icon={Icons.setting} />
                      <span>Setting</span>
                    </StyledHeader>
                  )}
                />
              </Tabs>
            );
          }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      <Tabs type={args.cckControl.type} hideContent={true}>
        <Tab
          header={() => (
            <div style={{ display: 'flex', gap: '4px' }}>
              <SvgIcon icon={args.cckIcons.diamonds} />
              <span>Dashboard</span>
            </div>
          )}
        />
        <Tab
          header={() => (
            <div style={{ display: 'flex', gap: '4px' }}>
              <SvgIcon icon={args.cckIcons.tools} />
              <span>Tools</span>
            </div>
          )}
        />
        <Tab
          header={() => (
            <div style={{ display: 'flex', gap: '4px' }}>
              <SvgIcon icon={args.cckIcons.setting} />
              <span>Setting</span>
            </div>
          )}
        />
      </Tabs>
    </>
  ),
};
