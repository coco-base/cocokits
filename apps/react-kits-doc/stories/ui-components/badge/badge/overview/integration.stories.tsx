import { Badge } from '@cocokits/react-badge';
import { Button } from '@cocokits/react-button';
import { Divider } from '@cocokits/react-divider';
import { Menu, MenuItem } from '@cocokits/react-menu';
import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Integration: StoryObj<typeof Badge> = {
  name: 'Integration',
  parameters: {
    docs: {
      description: {
        story:
          'Badges attached to interactive components.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Badge } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <Button>
                  <span>Button</span>
                  <Badge type="<%= type %>" content="2"/>
                </Button>

                <Tabs hideContent={true}>
                  <Tab header={() => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Header 1</span>
                      <Badge type="<%= type %>" content="2"/>
                    </div>
                  )}/>
                  <Tab header="Header 2" />
                  <Tab header="Header 3" />
                </Tabs>

                <Menu open={true} _skipOverlay={true}>
                  <MenuItem>Edit</MenuItem>
                  <MenuItem>Duplicate</MenuItem>
                  <Divider />
                  <MenuItem>
                    <span>Share</span>
                    <Badge type="<%= type %>" content="2"/>
                  </MenuItem>
                </Menu>
              </>

            );
          }
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      <Button>
        <span>Button</span>
        <Badge type={args.cckControl.type} content="2"/>
      </Button>

      <Tabs hideContent={true}>
        <Tab header={() => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Header 1</span>
            <Badge type={args.cckControl.type} content="2"/>
          </div>
        )}/>
        <Tab header="Header 2" />
        <Tab header="Header 3" />
      </Tabs>

      <Menu open={true} _skipOverlay={true}>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <Divider />
        <MenuItem>
          <span>Share</span>
          <Badge type={args.cckControl.type} content="2"/>
        </MenuItem>
      </Menu>
    </>
  ),
};
