import cloudinary from './cloudinary.js'

//upload buffer to cloudinary and return result
export const uploadToCloudinary=(buffer)=>{
    return new Promise((resolve,reject)=>{
        const stream=cloudinary.uploader.upload_stream(
            {folder:"ebc_users"},
            (err,result)=>{
                if(err) return reject(err);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};
