//calculate points awarded based on alert level
export const calculatePoints=(alertLevel)=>{
    const pointMap={
        GREEN:1,
        YELLOW:5,
        RED:25,
        BLACK:100,
    };
    return pointMap[alertLevel] || 0;
};
