import { setCompodocJson } from '@storybook/addon-docs/angular';

// This file will be available after first build, Just to skip the IDE error we use `require` instead of `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docJson = require('../../../../dist/compodoc/angular-components/documentation.json');
setCompodocJson(docJson);
