// CSV Exporter using papaparse
// FR-022, FR-024: Generate and export CSV spreadsheets

import Papa from 'papaparse';
import { Project, Photo } from '../db/schema';
import { formatCoordinates, formatAccuracy } from './geocoding';
import { saveReport } from './fileStorage';
import { format } from 'date-fns';

interface CsvRow {
  PhotoNumber: number;
  CapturedAt: string;
  Latitude: string;
  Longitude: string;
  Coordinates: string;
  Accuracy: string;
  Address: string;
  Notes: string;
  OverlayStyle: string;
  StampedFile: string;
  CleanFile: string;
}

function getOverlayStyleName(style: number): string {
  const names: Record<number, string> = { 1: 'Industrial Badge', 2: 'Clean Inspector', 3: 'Corporate Minimalist' };
  return names[style] ?? 'Standard';
}

/** Generate CSV string from project photos */
export function buildCsvContent(project: Project, photos: Photo[]): string {
  const rows: CsvRow[] = photos.map((photo, i) => ({
    PhotoNumber: i + 1,
    CapturedAt: format(new Date(photo.capturedAt), 'yyyy-MM-dd HH:mm:ss'),
    Latitude: photo.latitude.toFixed(8),
    Longitude: photo.longitude.toFixed(8),
    Coordinates: formatCoordinates(photo.latitude, photo.longitude),
    Accuracy: formatAccuracy(photo.accuracy),
    Address: photo.address ?? 'Unavailable',
    Notes: photo.notes ?? '',
    OverlayStyle: getOverlayStyleName(photo.overlayStyle),
    StampedFile: photo.stampedUri,
    CleanFile: photo.cleanUri,
  }));

  return Papa.unparse(rows, {
    header: true,
    newline: '\r\n',
  });
}

/** Generate and save CSV file, returns the file URI */
export async function exportCsv(project: Project, photos: Photo[]): Promise<string> {
  const csvContent = buildCsvContent(project, photos);
  const filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
  const uri = await saveReport(filename, csvContent);
  return uri;
}
