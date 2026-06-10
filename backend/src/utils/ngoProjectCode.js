/** Build a project code slug from the project name. */
export function generateProjectCode(name) {
  const slug = (name || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug ? `PRJ-${slug}` : '';
}

/** Ensure the generated code is unique within an organization. */
export function resolveUniqueProjectCode(baseCode, existingCodes = []) {
  const codes = new Set(existingCodes.filter(Boolean));
  if (!baseCode) return '';
  if (!codes.has(baseCode)) return baseCode;

  let suffix = 2;
  while (codes.has(`${baseCode}-${suffix}`)) {
    suffix += 1;
  }
  return `${baseCode}-${suffix}`;
}
