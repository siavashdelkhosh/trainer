export const greaterThanTwoSeconds = (getRemainingTime: () => number) =>
  getRemainingTime() > 2000;
