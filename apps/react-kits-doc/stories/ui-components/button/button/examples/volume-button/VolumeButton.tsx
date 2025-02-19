import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/volume-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

import { Styled } from './VolumeButton.styled';

const MAX_VOLUME = 5;
const MIN_VOLUME = 0;

export function VolumeButton(props: {cckExampleArgs: ExampleArgs}) {
  const [volume, setVolume] = useState(3);

  const volumeIcon = () => {
    switch (volume) {
      case 0:
        return Icons.volumeMute;
      case 1:
        return Icons.volumeOff;
      case 2:
        return Icons.volumeLow;
      case 3:
        return Icons.volume;
      case 4:
        return Icons.volumeHigh;
      default:
        return Icons.volumeHigh;
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
      <Button size="sm" onClick={decreaseVolume}>
        <SvgIcon icon={Icons.minus} />
      </Button>

      <Styled.Label>{props.cckExampleArgs.name}</Styled.Label>

      <SvgIcon
        size={props.cckExampleArgs.volumeIconSize}
        color={props.cckExampleArgs.volumeIconColor}
        icon={volumeIcon()}
      />

      <Styled.Label>{volume}</Styled.Label>

      <Button size="sm" onClick={increaseVolume}>
        <SvgIcon icon={Icons.plus} />
      </Button>

    </Styled.Host>
  );
}
