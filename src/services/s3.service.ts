import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
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
    if (!key) {
      console.warn("⚠️ Attempted to delete file with empty key");
      return;
    }

    try {
      // First check if file exists
      const exists = await this.fileExists(key);
      if (!exists) return;

      await s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
      );
    } catch (error) {
      console.error(`❌ Failed to delete file ${key}:`, error);
      throw error;
    }
  }

  static async fileExists(key: string): Promise<boolean> {
    try {
      await s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key })
      );
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
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

  // CLEAN UP OLD FILES
  static async cleanupTenantFiles(tenantId: string): Promise<void> {
    const prefix = `tenant-documents/${tenantId}/`;
    const files = await this.listFiles(prefix);

    for (const file of files) {
      try {
        await this.deleteFile(file);
      } catch (error) {
        console.error(`Failed to delete ${file}:`, error);
      }
    }
  }
}
