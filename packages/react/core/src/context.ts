'use client';
import { createContext } from 'react';

import { ThemeConfig } from '@cocokits/core';

export const ThemeConfigContext = createContext<ThemeConfig | undefined>(undefined);
