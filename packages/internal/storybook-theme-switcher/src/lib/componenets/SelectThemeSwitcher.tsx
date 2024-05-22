import React, { ChangeEvent } from 'react';

import { useDocPageTheme } from '../hooks/useDocPageTheme';

export const SelectThemeSwitcher = () => {

  const {selectedTheme, updateTheme, themes} = useDocPageTheme();

  return (
    <select value={selectedTheme.id} onChange={(e: ChangeEvent<HTMLSelectElement>) => updateTheme(e.target.value)}>
      {themes.map(theme => (
        <option key={theme.name} value={theme.id}>{theme.name}</option>
      ))}
    </select>
  );
};