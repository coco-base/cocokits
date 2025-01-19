import { Args, PreparedStory } from '@storybook/types';
import { useEffect, useState } from 'react';

import { getInstance } from '@cocokits/common-utils';

import { generateSourceCode } from './source-code-generator';
import { GeneratedSourceCode } from './use-source-code-generator.model';
import { useColorMode } from '../../utils/use-preview-color-mode';
import { useTheme } from '../../utils/use-preview-theme';
import { StoryControlStore } from '../story-control/preview-story-args.store';

interface SourceCodeGenerator {
  loading: boolean;
  sourceCodes: GeneratedSourceCode[];
}

const INITIALIZE_SOURCE_CODE: SourceCodeGenerator = {
  loading: true,
  sourceCodes: [],
};

export function useSourceCodeGenerator(story: PreparedStory, pause = false): SourceCodeGenerator {
  const storyControlStore = getInstance(StoryControlStore);
  const [sourceCode, setSourceCode] = useState<SourceCodeGenerator>(INITIALIZE_SOURCE_CODE);
  const [args, setArgs] = useState<Args>(storyControlStore.getArgs(story.id));
  const { colorMode } = useColorMode();
  const { dispatchTheme, ...theme } = useTheme();

  useEffect(() => {
    if (pause) {
      return;
    }

    const subscription = storyControlStore.getArgs$(story.id).subscribe((_args) => {
      setArgs(_args);
    });

    return () => subscription.unsubscribe();
  }, [story.id, pause]);

  useEffect(() => {
    if (pause) {
      setSourceCode({ ...sourceCode, loading: true });
      return;
    }

    setSourceCode({ ...sourceCode, loading: true });

    const { promise, terminate } = generateSourceCode({ story, colorMode, args, theme });

    promise
      .then((sourceCodes) => {
        setSourceCode({ loading: false, sourceCodes });
      })
      .catch((error) => {
        console.error('Error generating source code', error);
      });

    return () => terminate();
  }, [story.id, args, colorMode, theme.id, pause]);

  return sourceCode;
}
