export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface IEmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

export type FileUploadResult = {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
};

export type UploadOptions = {
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
  public?: boolean;
};