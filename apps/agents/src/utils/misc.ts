export const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// returns the hours by 100 + minutes; example: 10:30 -> 1030
export const getNowHrsAndMinutes = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours * 100;
  return formattedHours + minutes;
};


export const dashLine = '----------\n';

