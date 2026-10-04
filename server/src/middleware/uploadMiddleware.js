import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const uploadDirectory =
  process.env.VERCEL === "1"
    ? "/tmp/bloodcare/uploads/verification"
    : path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../uploads/verification",
      );

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Vercel's /tmp filesystem is writable but ephemeral, not persistent storage.
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
      callback(error, uploadDirectory);
    });
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${req.user._id}-${Date.now()}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const verificationUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new Error("Only PDF, JPG, PNG, and WEBP files are allowed."),
      );
    }
    callback(null, true);
  },
});

export { uploadDirectory };
