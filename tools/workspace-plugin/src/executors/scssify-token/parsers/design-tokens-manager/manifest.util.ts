import fs from 'fs';

import { DTMManifest } from './design-tokens-manager.model';

export function getManifest(filePaths: string[]): DTMManifest {
  if (filePaths.length !== 1) {
    throw new Error(`Files in 'design token manger' but be only the path to the manifest token`);
  }

  const manifest = JSON.parse(fs.readFileSync(filePaths[0], { encoding: 'utf8' })) as DTMManifest;
  return manifest;
}
