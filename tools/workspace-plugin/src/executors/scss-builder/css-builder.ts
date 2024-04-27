import * as sass from 'sass';
import { OutputStyle } from 'sass/types/options';
import postcss from 'postcss';
import * as autoprefixer from 'autoprefixer';
import * as cssnano from 'cssnano';
import * as path from 'path';
import { Logger } from '../../utils/logger';
import * as fs from 'fs';

interface CssBuilderOptions {
  outputStyle: OutputStyle;
  sourceMap: boolean;
  outputPath: string;
}

export async function cssBuilder(
  scssPath: string,
  options: CssBuilderOptions
): Promise<{ cssPath: string; sourceMapPath: string | null }> {
  const scssParsedPath = path.parse(scssPath);

  const sassCompileResult = sass.compile(scssPath, {
    style: options.outputStyle,
    sourceMap: options.sourceMap,
    sourceMapIncludeSources: options.sourceMap,
  });

  const postCssPlugins =
    options.outputStyle === 'expanded'
      ? [autoprefixer({ cascade: false })]
      : [autoprefixer({ cascade: false }), cssnano()];

  const cssOutputPath =
    options.outputStyle === 'expanded'
      ? path.join(options.outputPath, scssParsedPath.name + '.css')
      : path.join(options.outputPath, scssParsedPath.name + '.min.css');

  const sourceMapOutputPath = options.sourceMap ? cssOutputPath + '.map' : null;
  const annotation = path.basename(cssOutputPath) + '.map';

  const postCssSourceMap = options.sourceMap
    ? { inline: false, prev: sassCompileResult.sourceMap, annotation }
    : undefined;

  const postCssResult = await postcss(postCssPlugins).process(sassCompileResult.css, {
    from: scssPath,
    to: cssOutputPath,
    map: postCssSourceMap,
  });

  postCssResult.warnings().forEach((warn) => {
    Logger.warning(warn.toString());
  });

  fs.writeFileSync(cssOutputPath, postCssResult.css);

  if (options.sourceMap) {
    fs.writeFileSync(sourceMapOutputPath, postCssResult.map.toString());
  }

  return {
    cssPath: cssOutputPath,
    sourceMapPath: sourceMapOutputPath,
  };
}
