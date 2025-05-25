import { Args } from '@storybook/types';

import { getInstance } from '@cocokits/common-utils';
import { ThemeConfigContext } from '@cocokits/react-core';
import { StoreState, ThemeEvent } from '@cocokits/storybook-addon-theme';

export function withThemeConfigDecorator() {
  return (Story: any) => {
    const theme = getInstance(ThemeEvent).currentTheme;
    return (
      <ThemeConfigContext.Provider value={theme.themeConfig}>
        <Story />
      </ThemeConfigContext.Provider>
    );
  };
}

export function withWrapperDecorator(
  {
    direction = 'row',
    insideBox = false,
  }: {
    direction?: 'row' | 'column';
    insideBox?: boolean;
  } = {},
  styles: Partial<CSSStyleDeclaration> = {}
): any {
  const classNames = ['story-decorator-wrapper'];

  if (direction === 'row') {
    classNames.push(`story-decorator-wrapper__row`);
  }

  if (direction === 'column') {
    classNames.push(`story-decorator-wrapper__column`);
  }

  if (insideBox) {
    classNames.push(`story-decorator-wrapper__inside-box`);
  }

  return (Story: any) => (
    <div style={styles as Record<string, string>} className={classNames.join(' ')}>
      <Story />
    </div>
  );
}

export function reactThemeArgsToTemplate(storyArgs: Args): Args {
  const args = storyArgs['cckControl'] as StoreState['args'];

  if (!args) {
    return {};
  }

  // const additionalThemeConfig = args.themeComponentConfig.additional;
  // const additionalKeys = Object.keys(additionalThemeConfig ?? {})
  //   .filter((key) => isNotNullish(args[key]));
  // const additional = reduceMerge(additionalKeys, (key) => ({ [key]: args[key] }), {});

  return {
    type: storyArgs.cckControl.type,
    size: storyArgs.cckControl.size,
    color: storyArgs.cckControl.color,
    // additional,
  };
}
