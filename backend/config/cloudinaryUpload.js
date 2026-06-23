import cloudinary from './cloudinary.js'

//upload buffer to cloudinary and return result
export const uploadToCloudinary=(buffer)=>{
    return new Promise((resolve,reject)=>{
        const stream=cloudinary.uploader.upload_stream(
            {folder:"ebc_users"},
            (err,result)=>{
                if(err)
                {
                    //log full cloudinary error for debugging
                    console.error("CLOUDINARY UPLOAD ERROR:",JSON.stringify({
                        name:err?.name,
                        message:err?.message,
                        http_code:err?.http_code,
                        error:err?.error
                    }));
                    return reject(err);
                }
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};
