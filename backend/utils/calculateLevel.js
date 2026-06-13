export const calculateLevel = (points) => {
  if (points >= 1000) {
    return "Diamond";
  }

  if (points >= 101) {
    return "Platinum";
  }

  if (points >= 51) {
    return "Gold";
  }

  if (points >= 26) {
    return "Silver";
  }

  if (points >= 11) {
    return "Bronze";
  }

  return "Iron";
};