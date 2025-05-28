'use client';

import { ThemeConfigContext } from '@cocokits/react-core';
import { type ReactNode } from 'react';
import { websiteThemeConfig } from '../theme/theme-config';
import { useWebsiteContextCreation, WebsiteContext } from './app.context';

const App = ({ children }: { children: ReactNode }) => {
  const context = useWebsiteContextCreation();

  return (
    <>
      <ThemeConfigContext.Provider value={websiteThemeConfig}>
        <WebsiteContext.Provider value={context}>{children}</WebsiteContext.Provider>
      </ThemeConfigContext.Provider>
    </>
  );
};

export default App;
