export const calculatePriorityScore = (
  alertLevel,
  unitsRequired
) => {
  const alertScores = {
    GREEN: 10,
    YELLOW: 30,
    RED: 60,
    BLACK: 100,
  };

  return (
    (alertScores[alertLevel] || 0) +
    unitsRequired
  );
};