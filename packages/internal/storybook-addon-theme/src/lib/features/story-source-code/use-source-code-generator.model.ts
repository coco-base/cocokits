import type { Args } from '@storybook/types';

import { UIBaseComponentsName } from '@cocokits/core';

import { AddonParametersSource } from '../../model/addon.model';
import type { ThemeChangeEvent } from '../../model/event.model';
import type { ColorMode } from '../../model/theme.model';

export interface GenerateSourceCodeMessage {
  sourceCodes: AddonParametersSource[];
  componentName: UIBaseComponentsName;
  colorMode: ColorMode;
  args: Args;
  theme: ThemeChangeEvent;
}

export interface GeneratedSourceCode {
  fileName: string;
  code: string;
  html: string;
}
