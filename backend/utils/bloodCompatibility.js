const bloodCompatibilityMap = {
  "O-": ["O-"],

  "O+": ["O-", "O+"],

  "A-": ["O-", "A-"],

  "A+": ["O-", "O+", "A-", "A+"],

  "B-": ["O-", "B-"],

  "B+": ["O-", "O+", "B-", "B+"],

  "AB-": ["O-", "A-", "B-", "AB-"],

  "AB+": [
    "O-",
    "O+",
    "A-",
    "A+",
    "B-",
    "B+",
    "AB-",
    "AB+",
  ],
};

export default bloodCompatibilityMap;


export const canDonate = (
  donorBloodGroup,
  recipientBloodGroup
) => {
return (
  bloodCompatibilityMap[
    recipientBloodGroup
  ]?.includes(donorBloodGroup) || false
);
};


export const getCompatibleDonors = (
  recipientBloodGroup
) => {
  return (
    bloodCompatibilityMap[
      recipientBloodGroup
    ] || []
  );
};