export * from './icons/svg-icon-map';
export * from './token/collections';

import * as TsCssVariables from './token/ts-css-variables';
import * as TsVariables from './token/ts-variables';

export const Token = {
  ...TsCssVariables,
  ...TsVariables,
};
