/** @module pipes */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that transforms an object into an array of its keys.
 *
 * @example
 * Use this pipe to list object keys in a template.
 * ```html
 * <ul>
 *   <li *ngFor="let key of myObject | toObjKeys">{{ key }}</li>
 * </ul>
 * ```
 *
 * ```typescript
 * const myObject = { foo: 1, bar: 2 };`
 * ```
 */
@Pipe({
  name: 'objToKeys',
})
export class ObjToKeysPipe implements PipeTransform {
  transform<T>(value: T): (keyof T)[] {
    if (!value || typeof value !== 'object') {
      return [];
    }
    return Object.keys(value) as (keyof T)[];
  }
}
