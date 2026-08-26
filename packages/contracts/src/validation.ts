import type { z } from 'zod';

export function formatValidationError(label: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join('.') : '(root)';
    return `  - ${field}: ${issue.message}`;
  });
  return `${label} validation failed:\n${lines.join('\n')}`;
}
