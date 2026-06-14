//calculate next eligible donation date — 90 days after last donation
export const calculateNextEligibleDate=(donationDate)=>{
    const nextDate=new Date(donationDate);
    nextDate.setDate(nextDate.getDate()+90);
    return nextDate;
};

//check if donor is eligible to donate today
export const isEligibleToDonate=(nextEligibleDonationDate)=>{
    if(!nextEligibleDonationDate)
    {
        return true;
    }
    return new Date()>=new Date(nextEligibleDonationDate);
};
