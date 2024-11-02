export function getAngularTsconfigJsonChanges() {
  return {
    references: [{ path: './.storybook/tsconfig.json' }],
  };
}

export function getAngularTsconfigLibJsonChanges() {
  return {
    exclude: ['**/*.stories.ts', '**/*.stories.js'],
    include: ['stories/**/*.component.ts'],
  };
}

export function getReactTsconfigJsonChanges() {
  return {
    references: [{ path: './tsconfig.storybook.json' }],
  };
}
