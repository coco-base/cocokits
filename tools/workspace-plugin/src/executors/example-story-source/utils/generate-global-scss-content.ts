import type { ExampleStoryCssVariables, ThemeId as ThemeIdEnum } from '@cocokits/storybook-addon-theme';

export function generateGlobalScss({
  ThemeId,
  CSS_VARIABLES,
}: {
  ThemeId: typeof ThemeIdEnum;
  CSS_VARIABLES: ExampleStoryCssVariables;
}) {
  const source = Object.entries(ThemeId).reduce((_result, [themeIdKey, themeIdValue]) => {
    const code = Object.entries(CSS_VARIABLES[themeIdValue])
      .reduce((result, [key, value]) => {
        return `${result}\n        ${key}: ${value};`;
      }, '')
      .trim();

    if (!code) {
      return _result;
    }

    return (
      _result +
      `{
    language: 'scss',
    filename: 'global.scss',
    code: \`
      :root {${code.replaceAll('`', '\\`')}
      }\`,
    visibleConditions: [(theme) => theme.id === ThemeId.${themeIdKey}],
  },
  `
    );
  }, '');

  return source.trim();
}
