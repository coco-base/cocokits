export type FigmaImageFormat = 'png' | 'svg';

export interface FigmaNodeToImageExecutorSchema {
  figmaLinkUrl: string;
  format: FigmaImageFormat;
  outputPath: string;
}
