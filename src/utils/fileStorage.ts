// File storage helpers using expo-file-system (legacy API)
// All photos stored in app's private sandbox (NFR-007)

import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  writeAsStringAsync,
  deleteAsync,
  EncodingType,
} from 'expo-file-system/legacy';

const PHOTOS_DIR = `${documentDirectory}geoproof/photos/`;
const REPORTS_DIR = `${documentDirectory}geoproof/reports/`;

/** Ensure the photos directory exists */
export async function ensurePhotoDirectory(): Promise<void> {
  const info = await getInfoAsync(PHOTOS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

/** Ensure the reports directory exists */
export async function ensureReportsDirectory(): Promise<void> {
  const info = await getInfoAsync(REPORTS_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(REPORTS_DIR, { intermediates: true });
  }
}

/** Generate a unique timestamped filename */
export function generatePhotoFilename(suffix: 'stamped' | 'clean'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `photo_${timestamp}_${suffix}.jpg`;
}

/** Save a photo URI to the sandbox */
export async function savePhotoToSandbox(
  sourceUri: string,
  filename: string
): Promise<string> {
  await ensurePhotoDirectory();
  const destPath = `${PHOTOS_DIR}${filename}`;
  await copyAsync({ from: sourceUri, to: destPath });
  return destPath;
}

/** Save a base64-encoded image to the sandbox */
export async function saveBase64Photo(
  base64Data: string,
  filename: string
): Promise<string> {
  await ensurePhotoDirectory();
  const destPath = `${PHOTOS_DIR}${filename}`;
  await writeAsStringAsync(destPath, base64Data, {
    encoding: EncodingType.Base64,
  });
  return destPath;
}

/** Delete a single file from the sandbox */
export async function deleteFile(uri: string): Promise<void> {
  const info = await getInfoAsync(uri);
  if (info.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}

/** Delete all photos for a project (cascade cleanup) */
export async function deleteProjectPhotos(photoPaths: string[]): Promise<void> {
  await Promise.all(photoPaths.map(deleteFile));
}

/** Save a report file to the reports directory */
export async function saveReport(
  filename: string,
  content: string,
  encoding: EncodingType = EncodingType.UTF8
): Promise<string> {
  await ensureReportsDirectory();
  const destPath = `${REPORTS_DIR}${filename}`;
  await writeAsStringAsync(destPath, content, { encoding });
  return destPath;
}

export { PHOTOS_DIR, REPORTS_DIR };
