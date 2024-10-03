import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ThemeUIComponentsConfig } from '@cocokits/core';

import { UIComponentConfig } from './tokens';

export function provideCocokits(theme: ThemeUIComponentsConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: UIComponentConfig, useValue: theme }]);
}
