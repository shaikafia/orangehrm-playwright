export function getBlockedUrlRegex(path: string): RegExp {
  // Escape special regex characters so `path` is treated as a literal suffix.
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}$`);
}