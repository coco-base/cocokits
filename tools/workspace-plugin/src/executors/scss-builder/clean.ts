import * as fs from 'fs';

export function cleanOutputPath(outputPath: string) {
  if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true });
  }

  fs.mkdirSync(outputPath, { recursive: true });
}
