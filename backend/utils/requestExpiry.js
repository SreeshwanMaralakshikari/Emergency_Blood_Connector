export const calculateExpiryDate = (
  alertLevel
) => {
  const expiryDate = new Date();

  switch (alertLevel) {
    case "GREEN":
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;

    case "YELLOW":
      expiryDate.setDate(expiryDate.getDate() + 5);
      break;

    case "RED":
      expiryDate.setDate(expiryDate.getDate() + 3);
      break;

    case "BLACK":
      expiryDate.setDate(expiryDate.getDate() + 1);
      break;

    default:
      expiryDate.setDate(expiryDate.getDate() + 7);
  }

  return expiryDate;
};