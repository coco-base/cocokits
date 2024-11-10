import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ThemeConfig } from '@cocokits/core';

import { ThemeConfigToken } from './tokens';

export function provideCocokits(config: ThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ThemeConfigToken, useValue: config }]);
}
