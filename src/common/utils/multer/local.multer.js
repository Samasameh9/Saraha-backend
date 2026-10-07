import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exception/error.exception.js";

export const FileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};

export const localFileUpload = ({ maxFileSize = 5, validation = [] } = {}) => {
  const storage = multer.memoryStorage();
  return multer({
    storage,
    limits: {
      fileSize: maxFileSize * 1024 * 1024,
    },
  });
};

// for single file
export const processFile = async ({ file, validation = [] }) => {
  const result = await fileTypeFromBuffer(file.buffer);

  console.log(result);

  if (!result || !validation.includes(result.mime)) {
    throw BadRequestException({
      message: `Invalid file format: ${file.originalname}`,
    });
  }

  return {
    file,
    result,
  };
};

// save one file
export const saveFile = async ({ customPath = "general", file, result }) => {
  await mkdir(resolve(`assets/${customPath}`), { recursive: true });
  const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;

  await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);

  file.finalPath = uniqueFilePath;

  return file;
};

// for array
export const processFiles = async ({
  customPath = "user",
  files = [],
  validation = [],
}) => {
  const validatedFiles = [];

  for (const file of files) {
    const validatedFile = await processFile({
      file,
      validation,
    });

    validatedFiles.push(validatedFile);
  }

  const assets = [];

  for (const { file, result } of validatedFiles) {
    const savedFile = await saveFile({ customPath, file, result });

    assets.push(savedFile);
  }

  return assets;
};

// for fields
export const processFields = async ({
  customPath = "user",
  fields = {},
  validation = [],
}) => {
  const validatedFields = [];

  for (const field of Object.keys(fields)) {
    const validatedFiles = [];

    for (const file of fields[field]) {
      const validatedFile = await processFile({
        file,
        validation,
      });
      validatedFiles.push(validatedFile);
    }

    validatedFields.push({
      field,
      files: validatedFiles,
    });
  }
  const assets = [];
  for (const { field, files } of validatedFields) {
    const savedFiles = [];

    for (const { file, result } of files) {
      const savedFile = await saveFile({ customPath, file, result });
      savedFiles.push(savedFile);
    }

    assets.push({
      field,
      files: savedFiles,
    });
  }
  return assets;
};

export const processMulterUpload = async ({
  customPath,
  req,
  validation = [],
}) => {
  if (req.file) {
    const { file, result } = await processFile({
      file: req.file,
      validation,
    });
    req.file = await saveFile({
      customPath,
      file,
      result,
    });
  } else if (Array.isArray(req.files)) {
    req.files = await processFiles({
      customPath,
      files: req.files,
      validation,
    });
  } else if (
    req.files &&
    typeof req.files === "object" &&
    Object.keys(req.files)?.length
  ) {
    req.files = await processFields({
      customPath,
      fields: req.files,
      validation,
    });
  }
};


