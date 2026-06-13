export const calculateNextEligibleDate = (
  donationDate
) => {
  const nextDate = new Date(donationDate);

  nextDate.setDate(
    nextDate.getDate() + 90
  );

  return nextDate;
};

export const isEligibleToDonate = (
  nextEligibleDonationDate
) => {
  if (!nextEligibleDonationDate) {
    return true;
  }

  return (
    new Date() >=
    new Date(nextEligibleDonationDate)
  );
};