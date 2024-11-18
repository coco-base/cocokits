import { TooltipLinkList, WithTooltip } from "@storybook/components";
import React, { memo } from "react";

import { ColorMode } from "../../model/theme.model";
import { useColorMode } from "../../utils/use-manager-color-mode";

const COLOR_MODE_OPTIONS = [
  {
    id: ColorMode.Light,
    title: ColorMode.Light,
  }, {
    id: ColorMode.Dark,
    title: ColorMode.Dark,
  }
];

export const ToolColorMode = memo(() => {

  const { colorMode, dispatchColorMode } = useColorMode();

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      withArrows={true}
      closeOnOutsideClick
      tooltip={({ onHide }) => {
        return (
          <TooltipLinkList
            links={COLOR_MODE_OPTIONS.map(({id, title}) => ({
              id,
              title,
              active: colorMode === id,
              onClick: () => {
                dispatchColorMode(id);
                onHide();
              },
              // icon: themeName === 'dark'
              //   ? <StorybookDarkThemeIcon size='small' selected={themeName === selectedThemeName} />
              //   : <StorybookLightThemeIcon size='small' selected={themeName === selectedThemeName}/>,
              // right: themeName === selectedThemeName ? <CheckIcon /> : undefined,
            }))}
          />
        );
      }}>

      <p>Color Mode: {colorMode}</p>

      {/* <IconButton active={true} title="Storybook Theme">
        {selectedThemeName === 'light'
          ? <StorybookLightThemeIcon size='small' selected={true}></StorybookLightThemeIcon>
          : <StorybookDarkThemeIcon size='small' selected={true}></StorybookDarkThemeIcon>
        }
        <IconButtonLabel>{selectedThemeName}</IconButtonLabel>
      </IconButton> */}

    </WithTooltip>
  );
});