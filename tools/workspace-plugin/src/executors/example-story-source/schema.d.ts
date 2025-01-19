import type { AddonParametersSource } from '@cocokits/storybook-addon-theme';

export interface ExampleStorySourceExecutorSchema {
  rootDir: string;
}

export interface GeneratedAddonParametersSource extends AddonParametersSource {
  visibleConditions?: string[];
}
