import { Args, PreparedStory } from '@storybook/types';

import { lazyPromise } from '@cocokits/common-utils';

import { generateSourceCodeWorker } from './source-code-generator.worker';
import { GeneratedSourceCode, GenerateSourceCodeMessage } from './use-source-code-generator.model';
import { AddonParameters } from '../../model/addon.model';
import { ThemeChangeEvent } from '../../model/event.model';
import { ColorMode } from '../../model/theme.model';

export function generateSourceCode({
  story,
  colorMode,
  args,
  theme,
}: {
  story: PreparedStory;
  colorMode: ColorMode;
  args: Args;
  theme: ThemeChangeEvent;
}): {
  promise: Promise<GeneratedSourceCode[]>;
  terminate: () => void;
} {
  const { promise, reject, resolve } = lazyPromise<GeneratedSourceCode[]>();

  const parameters = story.parameters as AddonParameters;

  const sourceCodes = parameters.cckAddon.source;
  const componentName = parameters.cckAddon.componentName;

  if (!sourceCodes) {
    throw new Error(`No source code found for story: ${story.id}`);
  }

  if (!componentName) {
    throw new Error(`No component name found for story: ${story.id}`);
  }

  const worker = new Worker(new URL('./source-code-generator.worker.ts', import.meta.url), { type: 'module' });

  worker.postMessage({ sourceCodes, componentName, colorMode, args, theme } as GenerateSourceCodeMessage);
  worker.onmessage = (e) => {
    if (e.data.status === 'success') {
      resolve(e.data.result as GeneratedSourceCode[]);
    } else {
      reject(e.data.error);
    }
  };

  return {
    promise,
    terminate: () => worker.terminate(),
  };
}
