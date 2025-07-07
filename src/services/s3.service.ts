import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client } from "@/config/aws";
import { AWS_REGION, AWS_S3_BUCKET_NAME } from "@/config/env";

export interface S3UploadResult {
  key: string;
  location: string;
  bucket: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export class S3Service {
  private static bucket = AWS_S3_BUCKET_NAME;

  // UPLOAD FILE TO BUCKET
  static async uploadFile(
    file: Express.Multer.File,
    folder = "documents"
  ): Promise<S3UploadResult> {
    const ext = path.extname(file.originalname);
    const name = `${uuidv4()}${ext}`;
    const date = new Date().toISOString().split("T")[0];
    const key = `${folder}/${date}/${name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          timestamp: new Date().toISOString(),
        },
      })
    );

    return {
      key,
      location: `https://${this.bucket}.s3.${AWS_REGION}.amazonaws.com/${key}`,
      bucket: this.bucket,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  // DELETE FILE IN BUCKET
  static async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  // Generate signed URL for downloading
  static async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn }
    );
  }

  // Lists object keys under a prefix
  static async listFiles(prefix = ""): Promise<string[]> {
    const resp = await s3Client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix })
    );
    return (resp.Contents ?? []).map((obj) => obj.Key!).filter(Boolean);
  }
}
