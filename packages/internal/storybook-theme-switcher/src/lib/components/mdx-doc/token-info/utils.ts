import { Token } from '@cocokits/core';

export function hasTokenPreview(token: Token): boolean {
  return token.type === 'color' || token.type === 'dimension';
}
