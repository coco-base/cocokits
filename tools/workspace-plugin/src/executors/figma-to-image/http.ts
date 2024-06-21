import { FIGMA_API_URL } from './config';
import { FigmaImageFormat } from './schema';
import { extractImageId } from './util';

/**
 * Retrieves the image URL from Figma by sending a http request.
 */
export async function getImageUrl({
  token,
  fileId,
  nodeId,
  format,
}: {
  token: string;
  fileId: string;
  nodeId: string;
  format: FigmaImageFormat;
}): Promise<string> {
  try {
    const response = await fetch(`${FIGMA_API_URL}/images/${fileId}?ids=${nodeId}&format=${format}`, {
      headers: { 'X-Figma-Token': token },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    const imageId = extractImageId(nodeId);
    const imageUrl = data.images[imageId];

    return imageUrl;
  } catch (_error) {
    throw new Error('Failed to retrieve image URL from Figma. Please check the provided parameters and try again.');
  }
}

/**
 * Fetches the image data from a given image URL by sending a http request.
 */
export async function fetchImage(imageUrl: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}
