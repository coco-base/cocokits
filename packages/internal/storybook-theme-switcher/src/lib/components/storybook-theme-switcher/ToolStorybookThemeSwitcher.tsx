import { IconButton, TooltipLinkList, WithTooltip } from '@storybook/components';
import { CheckIcon as StorybookCheckIcon } from '@storybook/icons';
import { addons, useChannel } from '@storybook/manager-api';
import { styled } from '@storybook/theming';
import React, { memo, useEffect, useState } from 'react';

import {
  STORYBOOK_THEME_CHANGED_EVENT_NAME, StorybookThemeChangedEvent, StorybookThemeName,
} from '@cocokits/storybook-theme-switcher';

import { StorybookDarkThemeIcon } from './StorybookDarkThemeIcon';
import { StorybookLightThemeIcon } from './StorybookLightThemeIcon';

const IconButtonLabel = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
}));

const CheckIcon = styled(StorybookCheckIcon)(
  ({ theme }) => ({
    fill: theme.barSelectedColor,
  }),
);

const STORYBOOK_THEMES = ['dark', 'light'] as const;

export const ToolStorybookThemeSwitcher = memo(() => {

  const [selectedThemeName, setSelectedThemeName] = useState<StorybookThemeName>();

  const emit = useChannel({
    [STORYBOOK_THEME_CHANGED_EVENT_NAME]: ({ themeName }: StorybookThemeChangedEvent) => setSelectedThemeName(themeName)
  });

  const updateTheme = (themeName: StorybookThemeName) => {
    emit(STORYBOOK_THEME_CHANGED_EVENT_NAME, { themeName });
  };

  useEffect(() => {
    const lastEvents: StorybookThemeChangedEvent[] | undefined = addons.getChannel().last(STORYBOOK_THEME_CHANGED_EVENT_NAME);
    if(lastEvents && lastEvents.length > 0) {
      setSelectedThemeName(lastEvents[0].themeName);
    }
  }, []);

  return (
    <WithTooltip
      placement="top"
      trigger="click"
      withArrows={true}
      closeOnOutsideClick
      tooltip={({ onHide }) => {
        return (
          <TooltipLinkList
            links={STORYBOOK_THEMES.map((themeName) => ({
              id: themeName,
              title: themeName,
              active: themeName === selectedThemeName,
              onClick: () => {
                updateTheme(themeName);
                onHide();
              },
              icon: themeName === 'dark'
                ? <StorybookDarkThemeIcon size='small' selected={themeName === selectedThemeName} />
                : <StorybookLightThemeIcon size='small' selected={themeName === selectedThemeName}/>,
              right: themeName === selectedThemeName ? <CheckIcon /> : undefined,
            }))}
          />
        );
      }}>

      <IconButton active={true} title="Storybook Theme">
        {selectedThemeName === 'light'
          ? <StorybookLightThemeIcon size='small' selected={true}></StorybookLightThemeIcon>
          : <StorybookDarkThemeIcon size='small' selected={true}></StorybookDarkThemeIcon>
        }
        <IconButtonLabel>{selectedThemeName}</IconButtonLabel>
      </IconButton>

    </WithTooltip>
  );
});