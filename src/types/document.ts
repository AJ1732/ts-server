export interface DocumentUpload {
  filename: string;
  fileUrl: string;
  s3Key: string;
  uploadedAt: Date;
  size: number;
  mimeType: string;
}
