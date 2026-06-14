import jwt from 'jsonwebtoken'

//factory function — returns middleware for allowed roles
export const verifyToken=(...allowedRoles)=>{
    return (req,res,next)=>{
        //get token from cookie
        const token=req.cookies.token;

        if(!token)
        {
            return res.status(401).json({message:"Please Login First"});
        }
        try
        {
            //verify token
            const decodedToken=jwt.verify(token,process.env.SECRET_KEY);

            //check role
            if(allowedRoles.length>0 && !allowedRoles.includes(decodedToken.role))
            {
                return res.status(403).json({message:"You are not authorized"});
            }

            //attach user to request
            req.user=decodedToken;
            next();
        }
        catch(err)
        {
            res.status(401).json({message:"Session Expired. Please Relogin"});
        }
    };
};
