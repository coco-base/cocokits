import { ToObjKeysPipe } from './to-obj-keys.pipe';

describe('ToObjKeysPipe', () => {
  let pipe: ToObjKeysPipe;

  beforeEach(() => {
    pipe = new ToObjKeysPipe();
  });

  it('should return an empty array if value is null or undefined', () => {
    expect(pipe.transform(null)).toEqual([]);
    expect(pipe.transform(undefined)).toEqual([]);
  });

  it('should return an empty array if value is not an object', () => {
    expect(pipe.transform('string')).toEqual([]);
    expect(pipe.transform(123)).toEqual([]);
  });

  it('should return the object keys if value is an object', () => {
    const result = pipe.transform({ foo: 1, bar: 2 });
    expect(result).toEqual(['foo', 'bar']);
  });
});
