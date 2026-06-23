import multer from 'multer'

export const upload=multer({
    //store file in RAM — passed as buffer to cloudinary
    storage:multer.memoryStorage(),
    //2 MB max to prevent RAM overflow
    limits:{
        fileSize:2*1024*1024,
    },
    //only allow jpeg and png for security
    fileFilter:(req,file,cb)=>{
        if(file.mimetype==="image/jpeg" || file.mimetype==="image/png")
        {
            cb(null,true);
        }
        else
        {
            const err=new Error("Only JPG and PNG files are allowed");
            err.status=400;
            cb(err,false);
        }
    },
});
