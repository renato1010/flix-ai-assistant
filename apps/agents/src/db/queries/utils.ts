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

export function getNumberFromTimeString(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 100 + minutes;
}

// function returns "20:30" from 2030
export function getStringFromNumber(number: number): string {
  const hours = Math.floor(number / 100);
  const minutes = number % 100;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

