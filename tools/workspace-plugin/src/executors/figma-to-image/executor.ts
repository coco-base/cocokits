import { fetchImage, getImageUrl } from './http';
import { FigmaNodeToImageExecutorSchema } from './schema';
import { extractNodeIdAndFileId, getFigmaToken, saveImageToFile } from './util';
import { Logger } from '../../utils/logger';

export default async function runExecutor(options: FigmaNodeToImageExecutorSchema) {
  Logger.header('Convert figma element to image');

  const token = getFigmaToken();
  const { fileId, nodeId } = extractNodeIdAndFileId(options.figmaLinkUrl);

  const imageUrl = await getImageUrl({ token, fileId, nodeId, format: options.format });
  const imageArrayBuffet = await fetchImage(imageUrl);

  saveImageToFile(imageArrayBuffet, options.outputPath);

  Logger.success(`Generated file: ${options.outputPath}`);

  return {
    success: true,
  };
}
