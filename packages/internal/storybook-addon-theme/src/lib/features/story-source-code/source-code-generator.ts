import ejs from 'ejs';
import shikiThemeSlackDark from 'shiki/themes/slack-dark.mjs';
import shikiThemeSlackOchin from 'shiki/themes/slack-ochin.mjs';
import { ColorMode } from '../../model/theme.model';
import { Args, PreparedStory } from '@storybook/types';
import tsPlugin from 'prettier/plugins/typescript';
import { AddonParameters, AddonSourceCodeLanguages } from '../../model/addon.model';
import { createHighlighterCoreSync, LanguageRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import shikiAngularHtml from 'shiki/langs/angular-html.mjs';
import shikiAngularTs from 'shiki/langs/angular-ts.mjs';
import shikiHtml from 'shiki/langs/html.mjs';
import shikiJavascript from 'shiki/langs/javascript.mjs';
import shikiJson from 'shiki/langs/json.mjs';
import shikiScss from 'shiki/langs/scss.mjs';
import shikiShell from 'shiki/langs/shell.mjs';
import shikiTypescript from 'shiki/langs/typescript.mjs';
import prettier from 'prettier/standalone';
import esTreePlugin from 'prettier/plugins/estree';
import { BuiltInParserName, Plugin } from 'prettier';
import babelPlugin from 'prettier/plugins/babel';
import postcssPlugin from 'prettier/plugins/postcss';
import htmlPlugin from 'prettier/plugins/html';
import markdownPlugin from 'prettier/plugins/markdown';
import angularPlugin from 'prettier/plugins/angular';
import { ThemeChangeEvent } from '../../model/event.model';

export interface GeneratedSourceCode {
  fileName: string;
  code: string;
  html: string;
}

const SHIKI_LANGS_MAP: Record<AddonSourceCodeLanguages, LanguageRegistration[][]> = {
  'angular-html': [shikiAngularHtml],
  'angular-ts': [shikiAngularTs],
  html: [shikiHtml],
  javascript: [shikiJavascript],
  json: [shikiJson],
  scss: [shikiScss],
  shellscript: [shikiShell],
  typescript: [shikiTypescript],
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
};

export async function generateSourceCode({
  story,
  colorMode,
  args,
  theme,
}: {
  story: PreparedStory;
  colorMode: ColorMode;
  args: Args;
  theme: ThemeChangeEvent;
}): Promise<GeneratedSourceCode[]> {
  const parameters: AddonParameters = story.parameters;
  const sourceCodes = parameters.cckAddon?.source;
  const componentName = parameters.cckAddon?.componentName;

  if (!sourceCodes) {
    throw new Error(`No source code found for story: ${story.id}`);
  }

  if (!componentName) {
    throw new Error(`No component name found for story: ${story.id}`);
  }

  const shikiThemeRegistration = colorMode === ColorMode.Dark ? shikiThemeSlackDark : shikiThemeSlackOchin;
  const shikiThemeName = colorMode === ColorMode.Dark ? 'slack-dark' : 'slack-ochin';

  const result = await Promise.all(
    sourceCodes.map(async (sourceCode) => {
      const codeEjs = ejs.render(sourceCode.code, {
        ...args,
        cckThemeId: theme.id,
        cckThemeDisplayName: theme.displayName,
        cckThemeSelectedModes: theme.selectedModes,
        cckThemeComponentConfig: theme.themeConfig.components[componentName],
      });

      const codePrettier = await prettier.format(codeEjs, {
        parser: PRETTIER_PARSER_MAP[sourceCode.language],
        plugins: PRETTIER_PLUGINS_MAP[sourceCode.language],
      });

      const highlighter = createHighlighterCoreSync({
        themes: [shikiThemeRegistration],
        langs: SHIKI_LANGS_MAP[sourceCode.language],
        engine: createJavaScriptRegexEngine(),
      });

      const codeHighlighter = highlighter.codeToHtml(codePrettier, {
        lang: sourceCode.language,
        theme: shikiThemeName,
      });

      highlighter.dispose();

      return { code: codePrettier, html: codeHighlighter, fileName: sourceCode.filename };
    })
  );

  return result;
}
