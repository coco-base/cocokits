import { PreparedStory } from '@storybook/types';
import { useEffect, useState } from 'react';

import { getInstance } from '@cocokits/common-utils';
import { OverlayRef } from '@cocokits/react-overlay';

import { StoryControlStore } from './manager-story-args.store';
import { StoreState } from './story-control.model';
import { StyledControlWrapper } from './story-control.style';
import { StoryControlSelect } from './story-control-select';
import { StoryControlText } from './story-control-text';
import { AddonParametersControlType } from '../../model/addon.model';

export interface StoryControlDialogProps {
  story: PreparedStory;
}

export function StoryControlDialog({ data }: OverlayRef<StoryControlDialogProps, void>) {
  const [state, setState] = useState<StoreState>();
  const storyControlStore = getInstance(StoryControlStore);

  useEffect(() => {
    const subscription = storyControlStore.getState$(data.story.id).subscribe((_state) => {
      setState(_state);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [data.story]);

  if(!state) {
    return;
  }
  
  if (!state?.args) {
    return <p>No Args available</p>;
  }

  if (!state.controls || state.controls.length === 0) {
    return <p>No Control available</p>;
  }


  const onChange = (changes: Record<string, string>) => {
    storyControlStore.updateStoryArgs(data.story.id, changes);
  };

  return (
    <StyledControlWrapper>
      {state.controls.map((control) => {
        if (control.type === AddonParametersControlType.Text) {
          return (
            <StoryControlText
              key={control.storyArgKey}
              value={state.args[control.storyArgKey]}
              control={control}
              onChange={onChange}
            />
          );
        }
        if (control.type === AddonParametersControlType.Select) {
          return (
            <StoryControlSelect
              key={control.storyArgKey}
              control={control}
              value={state.args[control.storyArgKey]}
              onChange={onChange}
            />
          );
        }

        return null;
      })}
    </StyledControlWrapper>
  );
}

