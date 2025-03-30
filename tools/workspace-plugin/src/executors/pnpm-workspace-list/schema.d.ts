// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PnpmWorkspaceListExecutorSchema {}

export interface PnpmPackageInfo {
  name: string;
  version: string;
  path: string;
  private: boolean;
}
