// PDF Report Generator using expo-print
// FR-022, FR-023: Generate local structured PDF reports on-device

import * as Print from 'expo-print';
import { format } from 'date-fns';
import { Project, Photo } from '../db/schema';
import { formatCoordinates, formatAccuracy } from './geocoding';

interface ReportData {
  project: Project;
  photos: Photo[];
  isPremium?: boolean;
}

function getOverlayStyleName(style: number): string {
  const names: Record<number, string> = {
    1: 'Industrial Badge',
    2: 'Clean Inspector',
    3: 'Corporate Minimalist',
  };
  return names[style] ?? 'Standard';
}

/** Generate HTML content for the PDF report */
function buildReportHtml(data: ReportData): string {
  const { project, photos, isPremium } = data;
  const reportDate = format(new Date(), 'PPP');
  const totalPhotos = photos.length;

  const photoRows = photos
    .map((photo, i) => {
      const capTime = format(new Date(photo.capturedAt), 'dd MMM yyyy, HH:mm:ss');
      const coords = formatCoordinates(photo.latitude, photo.longitude);
      const accuracy = formatAccuracy(photo.accuracy);
      const address = photo.address ?? 'Address unavailable (offline)';
      const notes = photo.notes ?? '—';

      return `
        <div class="photo-entry">
          <div class="photo-number">Photo ${i + 1}</div>
          <img src="${photo.stampedUri}" class="photo-img" onerror="this.style.display='none'" />
          <table class="meta-table">
            <tr><td class="meta-label">Timestamp</td><td>${capTime}</td></tr>
            <tr><td class="meta-label">Coordinates</td><td>${coords}</td></tr>
            <tr><td class="meta-label">GPS Accuracy</td><td>${accuracy}</td></tr>
            <tr><td class="meta-label">Address</td><td>${address}</td></tr>
            <tr><td class="meta-label">Overlay Style</td><td>${getOverlayStyleName(photo.overlayStyle)}</td></tr>
            <tr><td class="meta-label">Notes</td><td>${notes}</td></tr>
          </table>
        </div>
      `;
    })
    .join('');

  const footerBranding = isPremium
    ? ''
    : '<div class="footer-watermark">Generated with GeoProof · GPS Field Documentation</div>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<title>GeoProof Report — ${project.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #0f172a; }
  .header { background: linear-gradient(135deg, #000000 0%, #1A1A00 100%); color: white; padding: 32px 40px; border-bottom: 4px solid #F5C518; }
  .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .header .subtitle { font-size: 13px; opacity: 0.7; letter-spacing: 1px; text-transform: uppercase; }
  .meta-bar { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 16px 40px; display: flex; gap: 40px; }
  .meta-bar .item label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 2px; }
  .meta-bar .item span { font-size: 14px; font-weight: 600; color: #0f172a; }
  .badge { display: inline-block; background: #F5C518; color: black; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-left: 6px; }
  .section { padding: 32px 40px; }
  .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 3px solid #F5C518; display: flex; align-items: center; gap: 8px; }
  .photo-entry { margin-bottom: 32px; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; page-break-inside: avoid; }
  .photo-number { background: #F5C518; color: #000000; font-size: 11px; font-weight: 700; padding: 6px 16px; letter-spacing: 1px; text-transform: uppercase; }
  .photo-img { width: 100%; max-height: 300px; object-fit: cover; display: block; background: #e2e8f0; }
  .meta-table { width: 100%; border-collapse: collapse; }
  .meta-table tr { border-bottom: 1px solid #e2e8f0; }
  .meta-table tr:last-child { border-bottom: none; }
  .meta-table td { padding: 8px 16px; font-size: 13px; }
  .meta-label { color: #64748b; font-weight: 600; width: 130px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .footer { text-align: center; padding: 24px; border-top: 1px solid #e2e8f0; margin-top: 16px; }
  .footer-watermark { color: #94a3b8; font-size: 11px; }
  .summary-box { background: #000000; color: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; gap: 32px; border-left: 4px solid #F5C518; }
  .summary-stat .num { font-size: 32px; font-weight: 700; color: #F5C518; }
  .summary-stat .label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
  @media print { .photo-entry { page-break-inside: avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>${project.name}</h1>
    <div class="subtitle">GeoProof Field Documentation Report</div>
  </div>

  <div class="meta-bar">
    <div class="item"><label>Report Date</label><span>${reportDate}</span></div>
    <div class="item"><label>Client</label><span>${project.clientName ?? '—'}</span></div>
    <div class="item"><label>Photos</label><span>${totalPhotos}</span></div>
    ${project.description ? `<div class="item"><label>Description</label><span>${project.description}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Field Documentation — ${totalPhotos} Photos</div>

    <div class="summary-box">
      <div class="summary-stat"><div class="num">${totalPhotos}</div><div class="label">Total Photos</div></div>
      <div class="summary-stat"><div class="num">${photos.filter(p => p.notes).length}</div><div class="label">With Notes</div></div>
      <div class="summary-stat"><div class="num">${photos.filter(p => p.address).length}</div><div class="label">Geocoded</div></div>
    </div>

    ${photoRows}
  </div>

  <div class="footer">
    ${footerBranding}
    <div style="color:#cbd5e1; font-size:10px; margin-top:6px;">
      Project created ${format(new Date(project.createdAt), 'PPP')} · Report generated ${format(new Date(), 'PPp')}
    </div>
  </div>
</body>
</html>`;
}

/** Generate and save a PDF report, returns the file URI */
export async function generatePdfReport(data: ReportData): Promise<string> {
  const html = buildReportHtml(data);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });
  return uri;
}
