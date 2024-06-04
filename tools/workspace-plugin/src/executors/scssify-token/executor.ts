import { buildCssVariables } from './builder/build-css-variables';
import { buildScssMixins } from './builder/build-mixin';
import { buildScssVariables } from './builder/build-scss-variables';
import { compileDesignToken } from './builder/compiler';
import { runPrettier } from './builder/prettier';
import { ScssifyTokenParser } from './model';
import { parseDesignTokensManager } from './parsers/design-tokens-manager/design-tokens-manager';
import { ScssifyTokenExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';

export default async function runExecutor(options: ScssifyTokenExecutorSchema) {
  Logger.header(`Running scssify token with ${options.parser} parser`);

  const parserResult = parseDesignTokens(options);
  const compilerResult = compileDesignToken(parserResult, options);
  buildScssMixins(compilerResult, options);
  buildCssVariables(compilerResult, options);
  buildScssVariables(compilerResult, options);

  runPrettier(options.outputDir);

  return {
    success: true,
  };
}

function parseDesignTokens(options: ScssifyTokenExecutorSchema) {
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
