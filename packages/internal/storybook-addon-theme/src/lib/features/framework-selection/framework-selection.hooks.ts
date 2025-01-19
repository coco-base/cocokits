import { useEffect, useState } from 'react';

import { getInstance } from '@cocokits/common-utils';

import { AddonConfig } from '../../data-access/addon-config/preview-addon-config';
import { AddonThemeConfig } from '../../model/addon.model';

export function useFramework() {
  const [framework, setFramework] = useState<AddonThemeConfig['framework'] | null>(null);

  useEffect(() => {
    getInstance(AddonConfig)
      .getAddonConfig()
      .then((config) => {
        setFramework(config.framework);
      });
  }, []);

  return framework;
}
