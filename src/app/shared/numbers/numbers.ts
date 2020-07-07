export const roundNumber = (value: number, countNumber = 2) => {
  const devider = Math.pow(10, countNumber);
  return Math.round((value + Number.EPSILON) * devider) / devider;
};

export const getRoundedPercent = (value: number, count = 2) => {
  if (isNaN(value)) {
    return `0 %`;
  }
  return `${roundNumber(value, count) * 100} %`;
};
