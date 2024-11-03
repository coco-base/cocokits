import { ThemeUIComponentsConfig } from '@cocokits/core';
import { createContext } from 'react';

export const UiComponentConfig = createContext<ThemeUIComponentsConfig | undefined>(undefined);
