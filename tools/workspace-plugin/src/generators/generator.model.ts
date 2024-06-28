export enum GeneratorDirectoryFormat {
  /**
   * When set to `as-provided`, the generator file is created in the given directory,
   * relative to the current working directory, independent of the project structure ([Working Directory]/[DIRECTORY])
   */
  AsProvided = 'as-provided',

  /**
   * If set to `root`, the file is created relative to the workspace root,
   * incorporating the project structure ([ROOT Directory]/[DIRECTORY])
   */
  Root = 'root',
}

export enum LibraryFramework {
  /**
   * The Angular framework.
   * Limitation: Type cannot be 'theme'.
   */
  Angular = 'angular',

  /**
   * The React framework.
   * Limitation: Type cannot be 'theme'.
   */
  React = 'react',

  /**
   * A shared framework usable across multiple projects.
   * Limitation: Type cannot be 'ui'.
   */
  Shared = 'shared',

  /**
   * The Storybook framework for building a storybook addons.
   * Limitation: Type must be 'utils'.
   */
  Storybook = 'storybook',
}
