import { buildCollectionsMap } from './build-collections-map';
import { buildCssVariables } from './build-css-variables';
import { buildScssMixins } from './build-mixin';
import { buildScssVariables } from './build-scss-variables';
import { buildTsCssVariables } from './build-ts-css-variables';
import { buildTsVariables } from './build-ts-variables';
import { ScssifyTokenExecutorSchema } from '../schema';
import { CompilerResult, ParserResult } from '../token.model';

export function build(parserResult: ParserResult, compilerResult: CompilerResult, options: ScssifyTokenExecutorSchema) {
  buildScssMixins(compilerResult, options);
  buildCssVariables(compilerResult, options);
  buildScssVariables(compilerResult, options);
  buildTsCssVariables(compilerResult, options);
  buildTsVariables(compilerResult, options);
  buildCollectionsMap(parserResult, options);
}
