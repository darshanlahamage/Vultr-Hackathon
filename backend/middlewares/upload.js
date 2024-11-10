import multer from 'multer';

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

export default upload.single('photo'); // Use 'photo' as the form field name