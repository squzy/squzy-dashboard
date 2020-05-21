export const roundNumber = (value: number, countNumber = 2) => {
  const devider = Math.pow(10, countNumber);
  return Math.round((value + Number.EPSILON) * devider) / devider;
};

export const getRoundedPercent = (value: number) => {
  if (isNaN(value)) {
    return `100 %`;
  }
  return `${roundNumber(value) * 100} %`;
};
