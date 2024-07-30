import { TokenGeneratorExecutorSchema } from './schema';
import { runPrettier } from './utils/prettier';
import { Logger } from '../../utils/logger';
import { TokenDictionary, TokenParser } from './token.model';
import { parseDesignTokensManager } from './parsers/design-tokens-manager/parser';
import { builder } from './builder/builder';

export default async function runExecutor(options: TokenGeneratorExecutorSchema) {
  Logger.header(`Running token generator with ${options.parser} parser`);

  // Parser
  const tokenDictionary = getTokenDictionary(options);

  // Builder
  builder(tokenDictionary, options);

  runPrettier(options.outputDir);

  return {
    success: true,
  };
}

function getTokenDictionary(options: TokenGeneratorExecutorSchema): TokenDictionary {
  switch (options.parser) {
    case TokenParser.DesignTokensManager:
      return parseDesignTokensManager(options);

    default:
      throw new Error(
        `Unsupported parser '${options.parser}'.\nAcceptable parsers include: '${Object.values(TokenParser).join(
          ', '
        )}'`
      );
  }
}