export const roundTwoNumber = (value: number) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const getRoundedPercent = (value: number) => {
  return `${roundTwoNumber(value) * 100} %`;
};
