// WatermarkOverlay Component
// Renders the GPS metadata overlay on top of photo previews and burned images
// Supports 3 styles (FR-014) and 4 positions (FR-015)
// Individual field toggles via FR-013

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import {
  WatermarkStyleId,
  WatermarkPosition,
  WATERMARK_STYLES,
  getPositionStyle,
} from '../constants/watermarkStyles';
import { formatCoordinates, formatAccuracy } from '../utils/geocoding';

export interface OverlayFields {
  showDate: boolean;
  showTime: boolean;
  showLatitude: boolean;
  showLongitude: boolean;
  showAccuracy: boolean;
}

interface WatermarkOverlayProps {
  styleId: WatermarkStyleId;
  position: WatermarkPosition;
  fields: OverlayFields;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address?: string | null;
  timestamp: Date;
  projectName?: string;
  showGeoProofBranding?: boolean; // Free tier watermark
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  styleId,
  position,
  fields,
  latitude,
  longitude,
  accuracy,
  address,
  timestamp,
  projectName,
  showGeoProofBranding = false,
}) => {
  const style = WATERMARK_STYLES[styleId];
  const posStyle = getPositionStyle(position);

  const dateStr = fields.showDate ? format(timestamp, 'dd MMM yyyy') : null;
  const timeStr = fields.showTime ? format(timestamp, 'HH:mm:ss') : null;
  const latStr = fields.showLatitude ? `${Math.abs(latitude).toFixed(6)}°${latitude >= 0 ? 'N' : 'S'}` : null;
  const lonStr = fields.showLongitude ? `${Math.abs(longitude).toFixed(6)}°${longitude >= 0 ? 'E' : 'W'}` : null;
  const accStr = fields.showAccuracy ? formatAccuracy(accuracy) : null;

  const renderRow = (label: string, value: string) => (
    <View key={label} style={styles.row}>
      <Text style={[styles.label, style.labelStyle]}>{label}</Text>
      <Text style={[styles.value, style.textStyle]}>{value}</Text>
    </View>
  );

  return (
    <View style={[posStyle, style.containerStyle]} pointerEvents="none">
      {projectName ? (
        <Text style={[styles.projectName, style.textStyle, { fontSize: 10, marginBottom: 3 }]}>
          📁 {projectName}
        </Text>
      ) : null}

      {(dateStr || timeStr) && (
        <View style={styles.dateTimeRow}>
          {dateStr && <Text style={[styles.dateTime, style.textStyle]}>{dateStr}</Text>}
          {dateStr && timeStr && <Text style={[styles.dateTime, style.textStyle]}> · </Text>}
          {timeStr && <Text style={[styles.dateTime, style.textStyle]}>{timeStr}</Text>}
        </View>
      )}

      {(latStr || lonStr) && (
        <View>
          {latStr && renderRow('LAT', latStr)}
          {lonStr && renderRow('LON', lonStr)}
        </View>
      )}

      {accStr && renderRow('ACC', accStr)}

      {address ? (
        <Text style={[styles.address, style.labelStyle]} numberOfLines={2}>
          {address}
        </Text>
      ) : null}

      {showGeoProofBranding && (
        <View style={styles.brandingRow}>
          <Text style={[styles.branding, style.labelStyle]}>Documented with GeoProof</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 1,
  },
  label: {
    width: 28,
  },
  value: {
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  dateTime: {
    // overridden by style.textStyle
  },
  projectName: {
    marginBottom: 2,
  },
  address: {
    marginTop: 3,
    maxWidth: 200,
  },
  brandingRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 3,
  },
  branding: {
    fontSize: 8,
    opacity: 0.7,
  },
});
