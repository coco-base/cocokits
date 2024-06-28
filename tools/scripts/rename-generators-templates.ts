import * as fs from 'fs';
import * as path from 'path';
import * as process from 'node:process';

/**
 * How to use this file:
 * npx tsx tools/scripts/rename-generators-templates.ts --dirPath [DIR_PATH]
 *
 */

let fileRenamed = 0;

function renameGeneratorsTemplates(dirPath: string) {
  // Read all items in the directory
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    // Iterate over each item in the directory
    files.forEach((file) => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        // Recursively rename files in sub-directories
        renameGeneratorsTemplates(filePath);
      } else {
        if (filePath.endsWith('.template')) {
          return;
        }

        // Generate the new file name by appending ".template"
        const newFilePath = `${filePath}.template`;
        // Rename the file
        try {
          fs.renameSync(filePath, newFilePath);
        } catch (err) {
          console.error('Error renaming file:', err);
        }
        console.log(`FROM: ${filePath}\nTO: ${newFilePath}\n`);
        fileRenamed++;
      }
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

// Process command-line arguments
const args = process.argv.slice(2);
const dirIndex = args.indexOf('--dirPath') + 1;
const dirPath = args[dirIndex];

if (!dirPath) {
  console.error(
    'Directory path is required. Usage: npx tsx tools/scripts/rename-generators-templates.ts --dirPath [DIR_PATH]'
  );
  process.exit(1);
}

// Call the function with the directory path from command line
renameGeneratorsTemplates(dirPath);
console.log(`Total file changed: ${fileRenamed}`);
