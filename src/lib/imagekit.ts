import { prisma } from "@/lib/prisma";

export async function getImageKitConfig() {
  const [pub, priv, url] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "IMAGEKIT_PUBLIC_KEY" } }),
    prisma.setting.findUnique({ where: { key: "IMAGEKIT_PRIVATE_KEY" } }),
    prisma.setting.findUnique({ where: { key: "IMAGEKIT_URL_ENDPOINT" } }),
  ]);
  
  return {
    publicKey: pub?.value || "",
    privateKey: priv?.value || "",
    urlEndpoint: url?.value || "",
  };
}

/**
 * Uploads a base64 encoded image or file buffer to ImageKit.io CDN
 * @param base64Data The base64 file data string (with or without data:image/... prefix)
 * @param fileName Name of the file (e.g. logo.png)
 */
export async function uploadToImageKit(base64Data: string, fileName: string, useUniqueFileName: boolean = true): Promise<string> {
  const config = await getImageKitConfig();
  if (!config.privateKey) {
    throw new Error("ImageKit Private Key is not configured in Admin Settings.");
  }
  
  // Clean up data URL prefix if present (e.g., "data:image/png;base64,...")
  let cleanBase64 = base64Data;
  if (base64Data.includes(";base64,")) {
    cleanBase64 = base64Data.split(";base64,").pop() || base64Data;
  }

  const formData = new FormData();
  formData.append("file", cleanBase64);
  formData.append("fileName", fileName);
  formData.append("useUniqueFileName", useUniqueFileName ? "true" : "false");
  
  const authHeader = "Basic " + Buffer.from(config.privateKey + ":").toString("base64");
  
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("ImageKit upload error response:", errText);
    throw new Error(`ImageKit upload failed: ${res.statusText}`);
  }
  
  const data = await res.json();
  return data.url;
}
