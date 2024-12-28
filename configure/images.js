const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : (req, file, cb) => 
        cb(null, 'uploads/'),
    filename : (req, file, cb) => 
        cb(null, `${Date.now()} - ${file.originalname}`)
})

const fileFilter = (req, file, cb) => {
    const allowedFileType = /jpeg|jpg|png|gif/;
    const extName = allowedFileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileType.test(file.mimetype);

    if(extName && mimetype){
        cb(null, true);
    }else{
        cb(new Error('Only images are allowed'))
    }
}

module.exports = multer({storage, fileFilter});