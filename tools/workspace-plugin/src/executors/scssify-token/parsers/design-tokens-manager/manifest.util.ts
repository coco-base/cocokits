import fs from 'fs';

import { DTMManifest } from './design-tokens-manager.model';

export function getManifest(files: string[]): DTMManifest {
  if (files.length !== 1) {
    throw new Error(`Files in 'design token manger' but be only the path to the manifest token`);
  }

  const manifest = JSON.parse(fs.readFileSync(files[0], { encoding: 'utf8' })) as DTMManifest;
  return manifest;
}
