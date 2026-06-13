export const generateRequestNumber = (
  count
) => {
  const year =
    new Date().getFullYear();

  const serialNumber =
    String(count + 1).padStart(
      5,
      "0"
    );

  return `REQ-${year}-${serialNumber}`;
};