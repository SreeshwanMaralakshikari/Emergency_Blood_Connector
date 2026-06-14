//blood group compatibility map — recipient -> compatible donors
const bloodCompatibilityMap={
    "O-":["O-"],
    "O+":["O-","O+"],
    "A-":["O-","A-"],
    "A+":["O-","O+","A-","A+"],
    "B-":["O-","B-"],
    "B+":["O-","O+","B-","B+"],
    "AB-":["O-","A-","B-","AB-"],
    "AB+":["O-","O+","A-","A+","B-","B+","AB-","AB+"],
};

export default bloodCompatibilityMap;

//check if donor can donate to recipient
export const canDonate=(donorBloodGroup,recipientBloodGroup)=>{
    return bloodCompatibilityMap[recipientBloodGroup]?.includes(donorBloodGroup) || false;
};

//get all compatible donor blood groups for a recipient
export const getCompatibleDonors=(recipientBloodGroup)=>{
    return bloodCompatibilityMap[recipientBloodGroup] || [];
};
