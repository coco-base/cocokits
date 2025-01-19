export function backtick(str: string): string {
  return `\`${str}\``;
}

export function code(str: string, inline = true): string {
  if (inline) {
    return `\`\`\`${str}\`\`\``;
  }
  return `
\`\`\`

${str}

\`\`\`
    `;
}

export function bold(str: string): string {
  return `**${str}**`;
}

export function header(level: number, str: string) {
  const result: string[] = new Array(level).fill('#');
  result.push(` ${str}`);
  return result.join('');
}
