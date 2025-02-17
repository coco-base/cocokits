'use client';
import { createContext } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';

import { RadioChangeEvent } from './radio.model';

export interface RadioContextValue<T extends string | number> extends UIBaseComponentProps {
  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  name?: string;
  selected?: T;
  disabled?: boolean;
  onChange?: (event: RadioChangeEvent<T>) => void;
}

export const RadioGroupContext = createContext<RadioContextValue<any> | null>(null);
