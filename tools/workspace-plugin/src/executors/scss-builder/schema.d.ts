export interface ScssBuilderExecutorSchema {
  files: { path: string; output: string; wrapWithWhereSudo: boolean }[];
  disableLog?: boolean;
}
