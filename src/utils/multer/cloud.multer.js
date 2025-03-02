import multer from 'multer'

export const fileValidations = {
    image:['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
       document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

// export const uploadCloudFile  = (fileValidations = []) =>{
//     const storage = multer.memoryStorage()

//     function fileFilter(req, file, cb){
//         if (fileValidations.includes(file.mimetype)) {
//             cb(null, true)
//         }else{
//             cb(new Error("Invalid file format. Allowed formats: " + fileValidations.join(", ")));
//         }
//     }

//     return multer({ fileFilter, storage})
// }

export const uploadCloudFile = (fileValidations = []) => {
    const storage = multer.memoryStorage();

    function fileFilter(req, file, cb) {
        console.log("Received file in Multer:", file); // Debugging log

        if (fileValidations.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log("Invalid file format:", file.mimetype);
            cb(null, false);
        }
    }

    return multer({ fileFilter, storage });
};
