import { Args, PreparedStory } from '@storybook/types';
import { useEffect, useState } from 'react';
import { useColorMode } from '../../utils/use-preview-color-mode';
import { GeneratedSourceCode, generateSourceCode } from './source-code-generator';
import { getInstance } from '@cocokits/common-utils';
import { StoryControlStore } from '../story-control/preview-story-args.store';
import { useTheme } from '../../utils/use-preview-theme';

interface SourceCodeGenerator {
  loading: boolean;
  sourceCodes: GeneratedSourceCode[];
}

const INITIALIZE_SOURCE_CODE: SourceCodeGenerator = {
  loading: true,
  sourceCodes: [],
};

export function useSourceCodeGenerator(story: PreparedStory) {
  const storyControlStore = getInstance(StoryControlStore);
  const [sourceCode, setSourceCode] = useState<SourceCodeGenerator>(INITIALIZE_SOURCE_CODE);
  const [args, setArgs] = useState<Args>(storyControlStore.getArgs(story.id));
  const { colorMode } = useColorMode();
  const theme = useTheme();

  useEffect(() => {
    const subscription = storyControlStore.getArgs$(story.id).subscribe((args) => {
      setArgs(args);
    });

    return () => subscription.unsubscribe();
  }, [story]);

  useEffect(() => {
    setSourceCode({ ...sourceCode, loading: true });

    generateSourceCode({ story, colorMode, args, theme }).then((sourceCodes) => {
      setSourceCode({ loading: false, sourceCodes });
    });
  }, [story, colorMode, args, theme.id]);

  return sourceCode;
}
