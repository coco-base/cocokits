import React from 'react';

import { AutoDocMain } from './AutoDocMain';
import { DocPage } from './DocPage';

export const StoryAutoDocPage = () => {

  console.log('StoryAutoDocPage');

  return (
    <DocPage hideCckThemeSwitcher={false}>
      <AutoDocMain></AutoDocMain>
    </DocPage>
  );
};