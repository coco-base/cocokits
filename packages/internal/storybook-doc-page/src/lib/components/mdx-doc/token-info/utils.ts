import { Token } from '@cocokits/workspace-plugin';

export function hasTokenPreview(token: Token): boolean {
  return token.type === 'color' || token.type === 'dimension';
}
