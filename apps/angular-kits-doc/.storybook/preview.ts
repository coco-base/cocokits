import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Parameters } from '@storybook/types';

import * as docJson from '../../../dist/compodoc/angular-kits-doc/documentation.json';

setCompodocJson(docJson);

export const parameters: Parameters = {
  viewMode: 'docs',
  controls: {
    disable: true,
    expanded: true,
  },
  actions: {
    disable: true,
  },
};
