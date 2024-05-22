import { IconButton, TooltipLinkList, WithTooltip} from '@storybook/components';
import { CheckIcon as StorybookCheckIcon } from "@storybook/icons";
import {styled} from '@storybook/theming';
import React, { memo } from 'react';

import {useManagerTheme} from "../hooks/useManagerTheme";



const IconButtonLabel = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
  marginLeft: "10px"
}));

const CheckIcon = styled(StorybookCheckIcon)(
  ({ theme }) => ({
    fill: theme.color.secondary
  }),
);


export const ToolThemeSwitcher = memo(() => {

  const { selectedTheme, updateTheme, themes } = useManagerTheme();

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      withArrows={true}
      closeOnOutsideClick
      tooltip={({ onHide }) => {
        return (
          <TooltipLinkList
            links={themes.map((theme) => ({
              id: theme.id,
              title: theme.name,
              active: theme.id === selectedTheme.id,
              onClick: () => {
                updateTheme(theme.id);
                onHide();
              },
              icon: <img width="14px" src={theme.icon} alt={theme.name}/>,
              right: theme.id === selectedTheme.id ? <CheckIcon/> : undefined
            }))}
          />
        );
      }}>

      <IconButton active={true} title="Theme">
        <img width="14px" src={selectedTheme.icon} alt={selectedTheme.name}/>
        <IconButtonLabel>{selectedTheme.name}</IconButtonLabel>
      </IconButton>

    </WithTooltip>
  );
});