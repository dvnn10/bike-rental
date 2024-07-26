var multer = require('multer');

const currentTime = new Date();
const monthof = currentTime.getMonth() + 1;
const day = currentTime.getDate();
const year = currentTime.getFullYear();
const fs = require('fs');
const maxSize = 50 * 1024 * 1024;

var dircheck = './public/uploads/' + year + '/' + monthof + '/' + day + '/';
if (!fs.existsSync(dircheck)) {
  fs.mkdir(dircheck, { recursive: true }, (err) => {
    if (err) throw err;
  });
}
var dir = 'public/uploads/' + year + '/' + monthof + '/' + day + '/';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    var filename = Date.now() + '-' + file.originalname;
    cb(null, filename);
  },
});

let fileFilter = (req, file, cb) => {
  if (
    file.mimetype == 'image/jpeg' ||
    file.mimetype == 'image/png' ||
    file.mimetype == 'image/svg+xml' ||
    file.mimetype == 'image/tiff' ||
    file.mimetype == 'image/jfif' ||
    file.mimetype == 'image/webp' ||
    file.mimetype == 'image/bmp' ||
    file.mimetype == 'image/gif'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadImage = multer({
  storage: storage,
  limits: { fileSize: maxSize, fieldSize: maxSize },
  fileFilter: fileFilter,
});

const uploadFiles = uploadImage.array('images', 12);

const uploadImages = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          msg: 'Too many files to upload.',
        });
      }
    } else if (err) {
      return res.send(err);
    }
    next();
  });
};

const getNumber = async (req, res, next) => {
  if (req.files == {}) {
    return res.status(400).json({
      msg: `You must select at least 1 image.`,
    });
  }
  next();
};

module.exports = {
  uploadImages: uploadImages,
  getNumber: getNumber,
};
