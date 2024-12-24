import { describe, expect, it } from 'vitest';
import { toCamelCase, toPascalCase, toKebabCase, toSnakeCase, toTitleCase } from './case';

describe('toCamelCase', () => {
  it('should convert "hello world" to "helloWorld"', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
  });

  it('should convert "Hello-World" to "helloWorld"', () => {
    expect(toCamelCase('Hello-World')).toBe('helloWorld');
  });

  it('should convert "hello_world" to "helloWorld"', () => {
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });

  it('should convert an empty string to an empty string', () => {
    expect(toCamelCase('')).toBe('');
  });

  it('should convert a single word to the same word', () => {
    expect(toCamelCase('hello')).toBe('hello');
  });
});

describe('toPascalCase', () => {
  it('should convert "hello world" to "HelloWorld"', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld');
  });

  it('should convert "Hello-World" to "HelloWorld"', () => {
    expect(toPascalCase('Hello-World')).toBe('HelloWorld');
  });

  it('should convert "hello_world" to "HelloWorld"', () => {
    expect(toPascalCase('hello_world')).toBe('HelloWorld');
  });

  it('should convert an empty string to an empty string', () => {
    expect(toPascalCase('')).toBe('');
  });

  it('should convert a single word to the same word with first letter capitalized', () => {
    expect(toPascalCase('hello')).toBe('Hello');
  });
});

describe('toKebabCase', () => {
  it('should convert "hello world" to "hello-world"', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });

  it('should convert "Hello-World" to "hello-world"', () => {
    expect(toKebabCase('Hello-World')).toBe('hello-world');
  });

  it('should convert "hello_world" to "hello-world"', () => {
    expect(toKebabCase('hello_world')).toBe('hello-world');
  });

  it('should convert an empty string to an empty string', () => {
    expect(toKebabCase('')).toBe('');
  });

  it('should convert a single word to the same word in lowercase', () => {
    expect(toKebabCase('Hello')).toBe('hello');
  });
});

describe('toSnakeCase', () => {
  it('should convert "hello world" to "hello_world"', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('should convert "Hello-World" to "hello_world"', () => {
    expect(toSnakeCase('Hello-World')).toBe('hello_world');
  });

  it('should convert "hello_world" to "hello_world"', () => {
    expect(toSnakeCase('hello_world')).toBe('hello_world');
  });

  it('should convert an empty string to an empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });

  it('should convert a single word to the same word in lowercase', () => {
    expect(toSnakeCase('Hello')).toBe('hello');
  });
});

describe('toTitleCase', () => {
  it('should convert "hello world" to "Hello World"', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('should convert "hello-world" to "Hello World"', () => {
    expect(toTitleCase('hello-world')).toBe('Hello World');
  });

  it('should convert "hello_world" to "Hello World"', () => {
    expect(toTitleCase('hello_world')).toBe('Hello World');
  });

  it('should convert an empty string to an empty string', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('should convert a single word to the same word with the first letter capitalized', () => {
    expect(toTitleCase('hello')).toBe('Hello');
  });
});
