import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';

import { DocPage } from '@coco-kits/storybook-core';

import * as docJson from '../../../../dist/compodoc/angular-icon/documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    docs: {
      page: DocPage,
    },
  },
};

export default preview;
