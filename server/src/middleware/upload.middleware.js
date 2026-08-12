import multer from 'multer';

const storage = multer.memoryStorage();

const allowedMimes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/json',
  'text/plain',
];

const fileFilter = (req, file, cb) => {
  if (
    allowedMimes.includes(file.mimetype) ||
    file.originalname.match(/\.(pdf|docx|doc|json)$/i)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word (.docx/.doc), or JSON files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;