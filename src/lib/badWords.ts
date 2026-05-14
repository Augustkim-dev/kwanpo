const BAD_WORDS = ["씨발", "개새끼", "병신", "존나", "지랄", "fuck", "shit", "bitch", "asshole"];

const pattern = new RegExp(BAD_WORDS.join("|"), "i");

export function containsBadWords(text: string): boolean {
  return pattern.test(text);
}
