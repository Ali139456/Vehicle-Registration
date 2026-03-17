declare module 'string-similarity' {
  export function compareTwoStrings(a: string, b: string): number;
  export function findBestMatch(
    mainString: string,
    targetStrings: string[]
  ): { bestMatch: { target: string; rating: number }; ratings: { target: string; rating: number }[] };
}
