import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../../dist/compodoc/packages/angular/checkbox/documentation.json');
setCompodocJson(docJson);

const preview: Preview = {};

export default preview;
