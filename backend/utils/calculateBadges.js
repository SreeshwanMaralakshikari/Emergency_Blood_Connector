export const calculateBadges = (
  donationsCount,
  totalPoints
) => {
  const badges = [];

  // Donation Milestones
  if (donationsCount >= 1) {
    badges.push("First Donation");
  }

  if (donationsCount >= 5) {
    badges.push("5 Donations");
  }

  if (donationsCount >= 10) {
    badges.push("10 Donations");
  }

  if (donationsCount >= 25) {
    badges.push("25 Donations");
  }

  if (donationsCount >= 50) {
    badges.push("50 Donations");
  }

  // Points Milestones
  if (totalPoints >= 100) {
    badges.push("100 Points");
  }

  if (totalPoints >= 500) {
    badges.push("500 Points");
  }

  if (totalPoints >= 1000) {
    badges.push("1000 Points");
  }

  return badges;
};