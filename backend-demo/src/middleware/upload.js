const multer = require('multer');

// Vercel tidak support disk storage → pakai memoryStorage
// File upload diabaikan di demo mode (tidak tersimpan permanen)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;
