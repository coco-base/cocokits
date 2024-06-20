import fs from 'fs';
import process from 'node:process';

/**
 * Retrieves the Figma API token from the environment variables.
 */
export function getFigmaToken(): string {
  const envToken = process.env.FIGMA_TOKEN;

  if (!envToken) {
    throw new Error('Figma API token is not set. Please generate a token and set it in the environment variables.');
  }

  return envToken;
}

/**
 * Extracts the file ID and node ID from a Figma link URL.
 * Example of URL: https://www.figma.com/file/zek9W2S3h5qJ5AxZNx19LN/Coco-Kits-Design-System?node-id=58-2481&t=ZEYUulgF2sdjgANS-4
 */
export function extractNodeIdAndFileId(figmaLinkUrl: string) {
  const fileIdPattern = /file|design\/([\w\d]+)/;
  const nodeIdPattern = /node-id=(.*)/;

  const fileIdMatch = figmaLinkUrl.match(fileIdPattern);
  const nodeIdMatch = figmaLinkUrl.match(nodeIdPattern);

  if (fileIdMatch && nodeIdMatch) {
    const fileId = fileIdMatch[1];
    const nodeId = nodeIdMatch[1];
    return { fileId, nodeId };
  }

  throw new Error('Invalid Figma URL: Unable to extract fileId or nodeId.');
}

/**
 * Saves the image data to a file.
 */
export function saveImageToFile(arrayBuffer: ArrayBuffer, outputPath: string) {
  const nodeBuffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, nodeBuffer);
}

/**
 * Executes the process of converting a Figma nodeId to an imageId.
 * Example NODE_ID format: "58-2481&t=Nu7onCUxOoqoMrpW-4"
 * Desired IMAGE_ID format: "58:248"
 */
export function extractImageId(nodeId) {
  const [idPart] = nodeId.split('&');
  const [pageId, nodeIdFragment] = idPart.split('-');
  const imageId = `${pageId}:${nodeIdFragment}`;

  return imageId;
}
