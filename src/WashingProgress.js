// Calculate washing progress based on elapsed time
export function updateProgress(duration, elapsedTime) {
  const progressPercentage = (elapsedTime / duration) * 100;
  const remainingTime = duration - elapsedTime;
  return { progressPercentage, remainingTime };
}

// 'simulates' the washing process, updates each second
export const startWashingProcess = (
  totalDuration,
  setElapsedTime,
  setIsWashing,
  setDoorStatus
) => {
  setIsWashing(true);
  setDoorStatus("Locked");

  const washingInterval = setInterval(() => {
    // console.log("setElapsedTime--washingInterval");
    setElapsedTime((prev) => {
      const newElapsedTime = prev + 1;
      if (newElapsedTime >= totalDuration) {
        clearInterval(washingInterval); // Stop washing when time is up
        setIsWashing(false);
        setDoorStatus("Unlocked");
      }
      return newElapsedTime;
    });
  }, 1000); // Update every second
};
