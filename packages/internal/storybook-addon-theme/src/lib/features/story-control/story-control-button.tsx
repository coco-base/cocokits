import { PreparedStory } from '@storybook/types';
import { useEffect, useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { getInstance } from '@cocokits/common-utils';
import { Button } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import { GlobalEvent } from '../../data-access/global-event/preview-global-event';

export interface StoryControlButtonProps {
  story: PreparedStory;
}

export function StoryControlButton({ story }: StoryControlButtonProps) {
  const globalEvent = getInstance(GlobalEvent);

  const [isControlSelected, setIsControlSelected] = useState(false);

  const onButtonClick = () => {
    if (isControlSelected) {
      globalEvent.dispatch.closeStoryControl();
      return;
    }

    globalEvent.dispatch.openStoryControl({ story });
    setIsControlSelected(true);
  };

  useEffect(() => {
    const subscription = globalEvent.closeStoryControl$.subscribe(() => {
      setIsControlSelected(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Button type={isControlSelected ? 'light' : 'basic'} onClick={onButtonClick}>
      <SvgIcon icon={Icons.control} />
      Control
    </Button>
  );
}
