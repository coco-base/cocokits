// eslint-disable-next-line camelcase
import { API_HashEntry } from '@storybook/types';
import React from 'react';

// eslint-disable-next-line camelcase
export const SidebarLabel = (item: API_HashEntry) => {
  return (
    <div>
      <span>{item.name}</span>
    </div>
  );
};