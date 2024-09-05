import { recordForEach } from '@cocokits/common-utils';
import { TokenDictionary } from '@cocokits/core';

import { TokenGeneratorExecutorSchema } from '../../schema';

export function fillVariableTokenDictionary(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  recordForEach(tokenDictionary.tokenMap, (token) => {
    token.variable.name = options.prefix + token.namePath.join('-'); // color-text-primary
    token.variable.css = `var(--${token.variable.name})`; // var(--color-text-primary)
    token.variable.scss = `$${token.variable.name}`; // $color-text-primary
  });
}
