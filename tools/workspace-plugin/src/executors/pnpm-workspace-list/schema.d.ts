export interface PnpmWorkspaceListExecutorSchema {
  /**
   * Determines the format of the output.
   *
   * If set to true, the output will include the names of the packages along with additional details.
   * If set to false, the output will include only the names of the packages.
   *
   * @default false
   */
  details: boolean;
}

export interface PnpmPackageInfo {
  name: string;
  version: string;
  path: string;
  private: boolean;
}
