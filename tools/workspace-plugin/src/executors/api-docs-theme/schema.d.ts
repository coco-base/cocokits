export interface ApiDocsThemeSchema {
  framework: 'angular' | 'react' | 'vue';
  outputDir?: string;
  baseDir?: string;
  tsConfig?: string;
}
