import { IconButton, TooltipLinkList, WithTooltip} from '@storybook/components';
import { CheckIcon as StorybookCheckIcon } from "@storybook/icons";
import {styled} from '@storybook/theming';
import React, {memo} from 'react';

import {THEMES,} from "../config/constants";
import {useTheme} from "../hooks/useTheme";




const IconButtonLabel = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
  marginLeft: "10px"
}));

const CheckIcon = styled(StorybookCheckIcon)(
  ({ theme }) => ({
    fill: theme.color.secondary
  }),
);


export const ToolThemeSwitcher = memo(function MyAddonSelector() {


  console.log('---- ToolThemeSwitcher ---- ');
  const { selectedTheme, updateTheme } = useTheme();


  return (
    <WithTooltip
      placement="top"
      trigger="click"
      withArrows={true}
      closeOnOutsideClick
      tooltip={({ onHide }) => {
        return (
          <TooltipLinkList
            links={THEMES.map((theme) => ({
              id: theme.name,
              title: theme.name,
              active: selectedTheme.name === theme.name,
              onClick: () => {
                updateTheme(theme);
                onHide();
              },
              icon: <img width="14px" src={theme.icon} alt={theme.name}/>,
              right: selectedTheme.name === theme.name ? <CheckIcon/> : undefined
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