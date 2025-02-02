import './cck-component.scss';
import { ThemeConfigContext } from "@cocokits/react-core";
import { cocokitsThemeConfig } from "@cocokits/theme-cocokits";
import { framesXThemeConfig } from "@cocokits/theme-frames-x";
import { ReactNode } from "react";

interface CckComponentProps {
  themeName: 'cocokits' | 'frames-x';
  name: string;
  children: ReactNode | ReactNode[];
}

export function CckComponent({ themeName, children, name }: CckComponentProps) {

  const themeConfig = themeName === 'cocokits' ? cocokitsThemeConfig : framesXThemeConfig;

  return (
    <div className="cck-component__host">
      <div className="cck-component__name">{name}</div>
        <ThemeConfigContext.Provider value={themeConfig}>
          {children}
        </ThemeConfigContext.Provider>
      
    </div>
  );
}
