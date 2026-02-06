import { ImageKitAdapter } from "@/adapter/storage/ImageKitAdapter.ts";
import { logger } from "@/middlewares/logger.middleware.ts";
import { ApiError } from "@/utils/ApiError.ts";
import { ApiResponse } from "@/utils/ApiResponse.ts";
import { asyncHandler } from "@/utils/asyncHandler.ts";
import { uploadSchema } from "@/validations/upload.validation.ts";

const storageAdapter = new ImageKitAdapter();

interface FileConfig {
  filePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

const enum FileContext {
  STATUS = "status",
  PROFILE = "profile",
  CHAT = "chat",
  MISE = "mise",
}

const validateFile = (context: string, mimeType: string): FileConfig => {
  let filePath = "";
  let maxFileSize = 0;
  let allowedMimeTypes: string[] = [];

  switch (context) {
    case FileContext.STATUS:
      filePath = `${FileContext.STATUS}/`;
      maxFileSize = 5 * 1024 * 1024 / (1024 * 1024);
      allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/webm",
      ];
      break;

    case FileContext.PROFILE:
      filePath = `${FileContext.PROFILE}/`;
      maxFileSize = 5 * 1024 * 1024 / (1024 * 1024);
      allowedMimeTypes = ["image/jpeg", "image/png"];
      break;

    default:
      filePath = `${FileContext.MISE || "misc"}/`;
      maxFileSize = 5 * 1024 * 1024 / (1024 * 1024);
      allowedMimeTypes = ["image/jpeg", "image/png"];
      break;
  }

  if (!allowedMimeTypes.includes(mimeType))
    throw new ApiError(
      400,
      `Invalid file type for ${context}. Allowed: ${allowedMimeTypes.join(", ")}`,
    );

  return { filePath, maxFileSize, allowedMimeTypes };
};

const generatePreSignedUrl = asyncHandler(async (req, res) => {
  logger.info(`Generating pre-signed URL for file upload`);

  const validationResult = await uploadSchema.safeParseAsync(req.body);

  if (!validationResult.success)
    throw new ApiError(400, validationResult.error.issues[0].message);

  const { context, fileName, mimeType } = validationResult.data;

  const { filePath, maxFileSize, allowedMimeTypes } = validateFile(context, mimeType);

  const preSignedUrl = await storageAdapter.generatePreSignedUrl(
    fileName,
    context,
    mimeType,
  );

  return res.status(201).json(
    new ApiResponse(201, "Pre-signed URL generated", {
      ...preSignedUrl,
      filePath,
      meta: {
        maxFileSize: `${maxFileSize}MB`,
        allowedMimeTypes,
      }
    }),
  );
});

export { generatePreSignedUrl };
