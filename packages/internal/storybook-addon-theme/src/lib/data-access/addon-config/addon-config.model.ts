import { AddonThemeConfig } from '../../model/addon.model';

export interface AddonConfigChange {
  forId: string;
  config: AddonThemeConfig;
}

export interface AddonConfigRegister {
  id: string;
}
