export interface TokensExecutorSchema {
  input: string | string[];
  output: string;
  modesOutput?: string;
  format?: 'css' | 'scss';
}
