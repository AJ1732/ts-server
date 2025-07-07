import multer from "multer";
import { createFileFilter } from "@/utils/file-filter";

// Use memory storage for S3 uploads
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: createFileFilter({
    allowedTypes: ["image", "pdf", "document"],
    maxSizeMB: 10,
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
});

// Specific upload configurations
export const uploadTenantDocuments = upload.fields([
  { name: "documents[cacCertificate]", maxCount: 1 },
  { name: "documents[validId]", maxCount: 1 },
  { name: "documents[utilityBill]", maxCount: 1 },
]);
