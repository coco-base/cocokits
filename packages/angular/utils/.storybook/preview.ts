import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';

import { PREVIEW_BASE } from '@cocokits/storybook-addon-theme-angular';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../../dist/compodoc/packages/angular/utils/documentation.json');
setCompodocJson(docJson);

const preview: Preview = {
  ...PREVIEW_BASE,
};

export default preview;
