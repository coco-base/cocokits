import { CompilerResult, ParserResult } from '../token.model';
import { ScssifyTokenExecutorSchema } from '../schema';
import { buildScssMixins } from './build-mixin';
import { buildCssVariables } from './build-css-variables';
import { buildScssVariables } from './build-scss-variables';
import { buildTsCssVariables } from './build-ts-css-variables';
import { buildTsVariables } from './build-ts-variables';
import { buildCollectionsMap } from './build-collections-map';

export function build(parserResult: ParserResult, compilerResult: CompilerResult, options: ScssifyTokenExecutorSchema) {
  buildScssMixins(compilerResult, options);
  buildCssVariables(compilerResult, options);
  buildScssVariables(compilerResult, options);
  buildTsCssVariables(compilerResult, options);
  buildTsVariables(compilerResult, options);
  buildCollectionsMap(parserResult, options);
}
