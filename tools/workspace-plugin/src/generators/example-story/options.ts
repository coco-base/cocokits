export interface ExampleStoryGeneratorOptions {
  name: string; // my-name
  className: string; // MyName
  propertyName: string; // myName
  constantName: string; // MY_NAME
  fileName: string; // my-name
  titleName: string; // My Name
  rawName: string; // original name from user input
  library: string;
  uiComponentName: string;
  angularInline: boolean;
  reactInline: boolean;
}
