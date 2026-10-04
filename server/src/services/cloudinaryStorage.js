import { configureCloudinary } from "../config/cloudinary.js";

export const uploadBuffer = (
  buffer,
  { folder, publicId, format, resourceType },
) =>
  new Promise((resolve, reject) => {
    const cloudinary = configureCloudinary();
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        format,
        resource_type: resourceType,
        type: "authenticated",
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("Cloudinary did not return asset metadata."));
        }
        resolve(result);
      },
    );
    upload.on("error", reject);
    upload.end(buffer);
  });

export const downloadBuffer = async ({ publicId, format, resourceType }) => {
  const cloudinary = configureCloudinary();
  const url = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Cloudinary download failed with status ${response.status}.`,
    );
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType:
      response.headers.get("content-type") || "application/octet-stream",
  };
};

export const deleteAsset = async ({ publicId, resourceType }) => {
  if (!publicId) return;
  const cloudinary = configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    invalidate: true,
  });
};
