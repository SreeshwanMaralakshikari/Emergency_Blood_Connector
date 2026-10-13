import {UserModel} from '../models/UserModel.js'

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

//make donors available again once their 90-day cooldown has passed
export const restoreEligibleDonors=async()=>{
    const now=new Date();
    await UserModel.updateMany(
        {role:"DONOR",isAvailable:false,nextEligibleDonationDate:{$ne:null,$lte:now}},
        {$set:{isAvailable:true,availabilityUpdatedAt:now}}
    );
};
