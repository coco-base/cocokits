export function getTsconfigJsonChanges() {
  return {
    references: [{ path: './.storybook/tsconfig.json' }],
  };
}

export function getTsconfigLibJsonChanges() {
  return {
    exclude: ['**/*.stories.ts', '**/*.stories.js'],
    include: ['stories/**/*.component.ts'],
  };
}
