/**
 * Custom sort: English A-Z first, then Hebrew א-ת.
 * Non-alpha characters go at the end.
 */

function getCharGroup(ch: string): number {
  const code = ch.charCodeAt(0);
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return 0; // English
  if (code >= 0x0590 && code <= 0x05ff) return 1; // Hebrew
  return 2; // Other
}

export function alphaSort(a: string, b: string): number {
  const aFirst = a.charAt(0);
  const bFirst = b.charAt(0);
  const groupA = getCharGroup(aFirst);
  const groupB = getCharGroup(bFirst);

  if (groupA !== groupB) return groupA - groupB;

  // Within same group, standard locale compare
  if (groupA === 1) {
    return a.localeCompare(b, "he");
  }
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

/** Sort an array by a string key, English A-Z then Hebrew א-ת */
export function sortByName<T>(items: T[], key: keyof T): T[] {
  return [...items].sort((a, b) => alphaSort(String(a[key]), String(b[key])));
}
