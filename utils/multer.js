const multer = require("multer");

function multerstorage() {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/assets/images/products/original");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  // Multer upload configuration
  const upload = multer({ storage: storage });
  return upload;
}

function bannerstorage(){
    const storagebanner = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, "./public/assets/images/banner");
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + "-" + file.originalname);
        },
      });
    
      // Multer upload configuration
      const uploadbanner = multer({ storage: storagebanner });
      return uploadbanner;
}

module.exports = {
  multerstorage,
  bannerstorage
};
