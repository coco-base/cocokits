import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';
import { BASE_ANGULAR_BUTTON_PREVIEW } from '@cocokits/storybook-addon-theme';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../../dist/compodoc/packages/angular/button/documentation.json');
setCompodocJson(docJson);

const preview: Preview = {
  ...BASE_ANGULAR_BUTTON_PREVIEW,
};

export default preview;
