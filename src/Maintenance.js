export let totalMoneyEarned = 0;
export let totalTimeSwitchedOn = 0;

export const updateTotalTimeSwitchedOn = (seconds) => {
  totalTimeSwitchedOn += seconds;
};

export const getStatistics = () => ({
  totalTimeSwitchedOn,
  totalMoneyEarned,
});

export const resetStatistics = () => {
  totalTimeSwitchedOn = 0;
  totalMoneyEarned = 0;
};
