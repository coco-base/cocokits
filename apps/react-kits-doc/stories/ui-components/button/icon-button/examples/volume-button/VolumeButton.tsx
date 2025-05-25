import { useState } from 'react';

import { LineIcons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/icon-button/volume-button.config';
import { IconButton, SvgIcon } from '@cocokits/react-components';

import { Styled } from './VolumeButton.styled';

const MAX_VOLUME = 5;
const MIN_VOLUME = 0;

export function VolumeButton(props: { cckExampleArgs: ExampleArgs }) {
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
        type={props.cckExampleArgs.buttonType}
        size={props.cckExampleArgs.buttonSize}
        color={props.cckExampleArgs.buttonColor}
        onClick={decreaseVolume}>
        <SvgIcon icon={LineIcons.minus} />
      </IconButton>

      <Styled.Wrapper>
        <Styled.Icon size={props.cckExampleArgs.volumeIconSize} color={null} icon={volumeIcon()} />
        <Styled.Label>{volume}</Styled.Label>
      </Styled.Wrapper>

      <IconButton
        type={props.cckExampleArgs.buttonType}
        size={props.cckExampleArgs.buttonSize}
        color={props.cckExampleArgs.buttonColor}
        onClick={increaseVolume}>
        <SvgIcon icon={LineIcons.plus} />
      </IconButton>
    </Styled.Host>
  );
}
