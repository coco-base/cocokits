/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'VolumeButton.styled.tsx',
    code: `
import styled from "styled-components";

import { SvgIcon } from "@cocokits/react-components";

const Host = styled.div\`
  display: flex;
  align-items: center;
  gap: 12px;
\`;

const Label = styled.span\`
  font: var(--volume-text-font);
  color: var(--volume-text-color);
\`;

const Icon = styled(SvgIcon)\`
  fill: var(--volume-text-color);
\`;

const Wrapper = styled.div\`
  display: flex;
  align-items: center;
  gap: 4px;
\`;

export const Styled = {
  Host,
  Label,
  Icon,
  Wrapper,
};`,
  },
  {
    language: 'tsx',
    filename: 'VolumeButton.tsx',
    code: `
import { useState } from 'react';

import { LineIcons } from '@cocokits/common-icons';

import { IconButton, SvgIcon } from '@cocokits/react-components';

import { Styled } from './VolumeButton.styled';

const MAX_VOLUME = 5;
const MIN_VOLUME = 0;

export function VolumeButton(props: {cckExampleArgs: ExampleArgs}) {
  const [volume, setVolume] = useState(3);

  const volumeIcon = () => {
    switch (volume) {
      case 0:
        return LineIcons.volumeMute;
      case 1:
        return LineIcons.volumeOff;
      case 2:
        return LineIcons.volumeLow;
      case 3:
        return LineIcons.volume;
      case 4:
        return LineIcons.volumeHigh;
      default:
        return LineIcons.volumeHigh;
    }
  };

  const increaseVolume = () => {
    setVolume(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume + 1)));
  };

  const decreaseVolume = () => {
    setVolume(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume - 1)));
  };

  return (
    <Styled.Host>
      <IconButton
        type='<%= buttonType %>'
        size='<%= buttonSize %>'
        color='<%= buttonColor %>'
        onClick={decreaseVolume}>
        <SvgIcon icon={LineIcons.minus} />
      </IconButton>

      <Styled.Wrapper>
        <Styled.Icon
          size='<%= volumeIconSize %>'
          color={null}
          icon={volumeIcon()}
        />
        <Styled.Label>{volume}</Styled.Label>
      </Styled.Wrapper>

      <IconButton
        type='<%= buttonType %>'
        size='<%= buttonSize %>'
        color='<%= buttonColor %>'
        onClick={increaseVolume}>
        <SvgIcon icon={LineIcons.plus} />
      </IconButton>

    </Styled.Host>
  );
}
`,
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--volume-text-font: var(--text-lg-regular);
        --volume-text-color: var(--color-font-default);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.CocoKits],
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--volume-text-font: var(--text-base-font-regular);
        --volume-text-color: var(--text-dark-primary);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.FramesX],
  },
];
