import './cck-component.scss';
import { ReactNode } from 'react';

import { ThemeConfigContext } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { framesXThemeConfig } from '@cocokits/theme-frames-x';

interface CckComponentProps {
  themeName: 'cocokits' | 'frames-x';
  name: string;
  children: ReactNode | ReactNode[];
  className?: string;
}

export function CckComponent({ themeName, children, name, className }: CckComponentProps) {
  const themeConfig = themeName === 'cocokits' ? cocokitsThemeConfig : framesXThemeConfig;

  return (
    <div className={`cck-component__host` + ` ${className ?? ''}`}>
      <div className="cck-component__name">{name}</div>
      <ThemeConfigContext.Provider value={themeConfig}>{children}</ThemeConfigContext.Provider>
    </div>
  );
}
