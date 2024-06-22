import React from 'react';
import { DocMain } from './DocMain';
import { DocPage } from './DocPage';

export const StoryDocPage = () => {

  return (
    <DocPage hideCckThemeSwitcher={false}>
      <DocMain></DocMain>
    </DocPage>
  );
};