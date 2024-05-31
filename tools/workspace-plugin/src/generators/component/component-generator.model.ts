export enum ComponentFramework {
  Angular = 'angular',
  React = 'react',
  Web = 'web',
}

export interface ComponentGeneratorOptions {
  /**
   * @return 'my-name'
   */
  name: string;

  /**
   * @return 'MyName'
   */
  className: string;

  /**
   * @return 'myName'
   */
  propertyName: string;

  /**
   * @return 'MY_NAME'
   */
  constantName: string;

  /**
   * @return 'my-name'
   */
  fileName: string;

  story: boolean;
  project: string;

  projectRoot: string;
  subDirectory: string;

  framework: ComponentFramework;
}
