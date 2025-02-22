import { useEffect, useRef, useState } from 'react';

import { Button, Divider, ElementAnchorPoint, Menu, MenuItem } from '@cocokits/react-components';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Menu> = {
  name: 'Default',
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
          import { Button, SvgIcon } from "@cocokits/react-components";

          export const MyComponent = () => {
            const buttonRef = useRef<HTMLButtonElement>(null);
            const [open, setOpen] = useState(false);


            return (
              <>
                <Button ref={buttonRef} onClick={() => setOpen(true)}>
                  Open
                </Button>

                <Menu 
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
                  <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
                  open={open}
                  targetRef={buttonRef}
                  menuAnchorPoint={'<%= anchorPoint %>'}
                  onMenuStatusChange={(isOpen) => setOpen(isOpen)}
                  closeOnSelectItem={<%= closeOnSelectItem %>}
                >
                  <MenuItem <% if (disabledFirstItem) { %> disabled <% } %>>Edit</MenuItem>
                  <MenuItem>Duplicate</MenuItem>
                  <Divider/>
                  <MenuItem>Archive</MenuItem>
                  <MenuItem disabled>Move</MenuItem>
                  <Divider/>
                  <MenuItem>Share</MenuItem>
                  <MenuItem>Add to favorite</MenuItem>
                </Menu>
              </>
            );
          };
          `,
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.color(),
        CCK_CONTROL.size(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.open(),
        CCK_CONTROL.closeOnSelectItem(),
        CCK_CONTROL.disabled(false, 'Disabled First Item', 'disabledFirstItem'),
        CCK_CONTROL.anchorPoint(ElementAnchorPoint.BottomLeft),
      ],
    },
  },
  render: (args) => <Story {...args} />,
};

function Story(args: Parameters<NonNullable<StoryObj<typeof Menu>['render']>>[0]) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(args.cckControl.open);

  useEffect(() => {
    setOpen(args.cckControl.open);
  }, [args.cckControl.open]);

  const onButtonClick = () => {
    setOpen(true);
  };

  return (
    <>
      <Button ref={buttonRef} onClick={onButtonClick}>
        Open
      </Button>

      <Menu
        {...reactThemeArgsToTemplate(args)}
        open={open}
        targetRef={buttonRef}
        menuAnchorPoint={args.cckControl.anchorPoint}
        onMenuStatusChange={(isOpen) => setOpen(isOpen)}
        closeOnSelectItem={args.cckControl.closeOnSelectItem}>
        <MenuItem disabled={args.cckControl.disabledFirstItem}>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <Divider />
        <MenuItem>Archive</MenuItem>
        <MenuItem disabled>Move</MenuItem>
        <Divider />
        <MenuItem>Share</MenuItem>
        <MenuItem>Add to favorite</MenuItem>
      </Menu>
    </>
  );
}
