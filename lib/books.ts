export type Book = {
  key?: string;
  title: string;
  author: string;
  coverId?: number;
  firstPublishYear?: number;
  color: string;
};

const spineColors = ["#665065", "#314d46", "#755e4d", "#315363", "#764a52", "#4b5e66"];

export function bookSpineColor(key: string) {
  let hash = 0;
  for (const character of key) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return spineColors[Math.abs(hash) % spineColors.length];
}
