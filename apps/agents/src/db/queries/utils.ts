export function getStringFromFormat(
  formats: {
    startTime: number[];
  }[]
): string[] {
  return formats
    .map(({ startTime }) => startTime)
    .flat()
    .map((time) => {
      // cast to string
      const stringTime = time.toString();
      // separate first two characters from last two
      const hours = stringTime.slice(0, 2);
      const minutes = stringTime.slice(2, 4);
      return `${hours}:${minutes}`;
    });
}
