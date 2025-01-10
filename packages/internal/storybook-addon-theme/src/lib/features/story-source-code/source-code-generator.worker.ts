import ejs from 'ejs';
import { BuiltInParserName, Plugin } from 'prettier';
import angularPlugin from 'prettier/plugins/angular';
import babelPlugin from 'prettier/plugins/babel';
import esTreePlugin from 'prettier/plugins/estree';
import htmlPlugin from 'prettier/plugins/html';
import markdownPlugin from 'prettier/plugins/markdown';
import postcssPlugin from 'prettier/plugins/postcss';
import tsPlugin from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';
import { createHighlighterCoreSync, LanguageRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import shikiAngularHtml from 'shiki/langs/angular-html.mjs';
import shikiAngularTs from 'shiki/langs/angular-ts.mjs';
import shikiHtml from 'shiki/langs/html.mjs';
import shikiJavascript from 'shiki/langs/javascript.mjs';
import shikiJson from 'shiki/langs/json.mjs';
import shikiScss from 'shiki/langs/scss.mjs';
import shikiShell from 'shiki/langs/shell.mjs';
import shikiTsx from 'shiki/langs/tsx.mjs';
import shikiTypescript from 'shiki/langs/typescript.mjs';
import shikiThemeSlackDark from 'shiki/themes/slack-dark.mjs';
import shikiThemeSlackOchin from 'shiki/themes/slack-ochin.mjs';

import type { GeneratedSourceCode, GenerateSourceCodeMessage } from './use-source-code-generator.model';
import type { AddonSourceCodeLanguages } from '../../model/addon.model';
import { ColorMode } from '../../model/theme.model';

self.onmessage = async (event) => {
  generateSourceCodeWorker(event.data)
    .then((result) => postMessage({ status: 'success', result }))
    .catch((error) => postMessage({ status: 'error', error: (error as Error).message }));
};

const SHIKI_LANGS_MAP: Record<AddonSourceCodeLanguages, LanguageRegistration[][]> = {
  'angular-html': [shikiAngularHtml],
  'angular-ts': [shikiAngularTs],
  html: [shikiHtml],
  javascript: [shikiJavascript],
  json: [shikiJson],
  scss: [shikiScss],
  shellscript: [shikiShell],
  typescript: [shikiTypescript],
  tsx: [shikiTsx],
};

const PRETTIER_PARSER_MAP: Record<AddonSourceCodeLanguages, BuiltInParserName> = {
  'angular-html': 'angular',
  'angular-ts': 'typescript',
  html: 'html',
  javascript: 'babel',
  json: 'json',
  scss: 'scss',
  shellscript: 'markdown',
  typescript: 'typescript',
  tsx: 'typescript',
};

const PRETTIER_PLUGINS_MAP: Record<AddonSourceCodeLanguages, Plugin[]> = {
  'angular-html': [htmlPlugin, angularPlugin],
  'angular-ts': [esTreePlugin, tsPlugin, htmlPlugin, angularPlugin],
  html: [htmlPlugin],
  javascript: [esTreePlugin, babelPlugin],
  json: [babelPlugin],
  scss: [postcssPlugin],
  shellscript: [markdownPlugin],
  typescript: [esTreePlugin, tsPlugin],
  tsx: [esTreePlugin, tsPlugin],
};

export async function generateSourceCodeWorker({
  sourceCodes,
  componentName,
  colorMode,
  args,
  theme,
}: GenerateSourceCodeMessage): Promise<GeneratedSourceCode[]> {
  const shikiThemeRegistration = colorMode === ColorMode.Dark ? shikiThemeSlackDark : shikiThemeSlackOchin;
  const shikiThemeName = colorMode === ColorMode.Dark ? 'slack-dark' : 'slack-ochin';

  const highlighter = createHighlighterCoreSync({
    themes: [shikiThemeRegistration],
    langs: Object.values(SHIKI_LANGS_MAP).flat(),
    engine: createJavaScriptRegexEngine(),
  });

  const generatedSourceCode = await Promise.all(
    sourceCodes.map(async (sourceCode) => {
      const sourceCodeWithoutExtraSpace = sourceCode.code
        /**
         * Move the ejs tag at the end of prevues line: TAG: `<% } %>`
         */
        .replace(/\n\s*<%\s*}\s*%>/g, '<% } %>')
        /**
         * Move the ejs tag at the end of prevues line: TAG: `<% }) %>`
         */
        .replace(/\n\s*<%\s*}\)\s*%>/g, '<% }) %>')
        /**
         * Move the ejs tag at the end of prevues line: TAG: `<% ... { %>` (such as if, for, etc)
         */
        .replace(/\n\s*<%(.*?)\{ %>/g, ' <% $1{ %>');

      const codeEjs = await ejs.render(
        sourceCodeWithoutExtraSpace,
        {
          ...args,
          themeId: theme.id,
          themeDisplayName: theme.displayName,
          themeSelectedModes: theme.selectedModes,
          themeComponentConfig: theme.themeConfig.components[componentName],
        },
        {
          async: true,
        }
      );

      const codePrettier = await prettier.format(codeEjs, {
        parser: PRETTIER_PARSER_MAP[sourceCode.language],
        plugins: PRETTIER_PLUGINS_MAP[sourceCode.language],
      });

      const codeHighlighter = highlighter.codeToHtml(codePrettier, {
        lang: sourceCode.language,
        theme: shikiThemeName,
      });

      return { code: codePrettier, html: codeHighlighter, fileName: sourceCode.filename };
    })
  );

  highlighter.dispose();

  return generatedSourceCode;
}
