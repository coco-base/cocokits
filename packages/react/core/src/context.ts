'use client';
import { ThemeConfig } from '@cocokits/core';
import { createContext } from 'react';

export const ThemeConfigContext = createContext<ThemeConfig | undefined>(undefined);
