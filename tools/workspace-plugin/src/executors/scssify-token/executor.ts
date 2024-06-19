import { compileDesignToken } from './builder/compiler';
import { runPrettier } from './builder/prettier';
import { ScssifyTokenParser } from './model';
import { parseDesignTokensManager } from './parsers/design-tokens-manager/design-tokens-manager';
import { ScssifyTokenExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';
import { build } from './builder/build';
import { ParserResult } from './token.model';

export default async function runExecutor(options: ScssifyTokenExecutorSchema) {
  Logger.header(`Running scssify token with ${options.parser} parser`);

  const parserResult = parseDesignTokens(options);
  const compilerResult = compileDesignToken(parserResult, options);

  build(parserResult, compilerResult, options);
  runPrettier(options.outputDir);

  return {
    success: true,
  };
}

function parseDesignTokens(options: ScssifyTokenExecutorSchema): ParserResult {
  switch (options.parser) {
    case ScssifyTokenParser.DesignTokensManager:
      return parseDesignTokensManager(options);

    default:
      throw new Error(
        `Unsupported parser '${options.parser}'.\nAcceptable parsers include: '${Object.values(ScssifyTokenParser).join(
          ', '
        )}'`
      );
  }
}
