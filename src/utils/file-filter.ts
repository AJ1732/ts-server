import { Request } from "express";
import { FileFilterCallback } from "multer";

type FileType = "image" | "pdf" | "document";
type AllowedMimeTypes = Record<FileType, string[]>;

const allowedMimeTypes: AllowedMimeTypes = {
  image: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  pdf: ["application/pdf"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
};

interface FileFilterOptions {
  allowedTypes?: FileType[];
  maxSizeMB?: number;
}

export const createFileFilter = (options: FileFilterOptions = {}) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const { allowedTypes = ["image", "pdf", "document"], maxSizeMB = 10 } =
      options;

    try {
      // Validate MIME type
      const isValidMime = allowedTypes.some((type) =>
        allowedMimeTypes[type].includes(file.mimetype)
      );

      if (!isValidMime) {
        const allowed = allowedTypes
          .map((t) => allowedMimeTypes[t])
          .flat()
          .join(", ");
        return cb(new Error(`Invalid file type. Allowed types: ${allowed}`));
      }

      // Validate file extension
      const fileExt = file.originalname.split(".").pop()?.toLowerCase();
      const dangerousExtensions = [
        "exe",
        "bat",
        "sh",
        "js",
        "jar",
        "msi",
        "scr",
      ];

      if (fileExt && dangerousExtensions.includes(fileExt)) {
        return cb(new Error("Potentially dangerous file type detected"));
      }

      // Validate file size (approximate check)
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size && file.size > maxSizeBytes) {
        return cb(new Error(`File too large. Max size: ${maxSizeMB}MB`));
      }

      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  };
};
