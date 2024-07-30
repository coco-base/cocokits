import { Logger } from '../../../utils/logger';

export function logStartParsing(format: string) {
  Logger.log(`\nStart building ${format}`);
}

export function logEndParsing(format: string) {
  Logger.log(`${format} has generated`);
}

export function logFileHasGenerated(path: string) {
  Logger.success(`Generated file: ${path}`);
}
