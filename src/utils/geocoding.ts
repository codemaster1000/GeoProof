// Reverse geocoding utility
// Uses expo-location's built-in reverseGeocodeAsync (no API key required)
// Falls back to raw coordinates offline (FR-010, FR-011)

import * as Location from 'expo-location';
import * as Network from 'expo-network';

export interface GeocodedAddress {
  formatted: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
}

/**
 * Attempt reverse geocoding from lat/lon.
 * Returns null if offline or geocoding fails.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress | null> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return null;
    }

    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!results || results.length === 0) return null;

    const place = results[0];

    // Build human-readable address
    const parts: string[] = [];
    if (place.streetNumber) parts.push(place.streetNumber);
    if (place.street) parts.push(place.street);
    if (place.district) parts.push(place.district);
    if (place.city) parts.push(place.city);
    if (place.region) parts.push(place.region);
    if (place.country) parts.push(place.country);

    return {
      formatted: parts.filter(Boolean).join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      street: place.street ?? undefined,
      city: place.city ?? undefined,
      region: place.region ?? undefined,
      country: place.country ?? undefined,
    };
  } catch {
    return null;
  }
}

/** Format coordinates as a display string */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lonDir}`;
}

/** Format accuracy display */
export function formatAccuracy(accuracy: number | null | undefined): string {
  if (accuracy == null) return '±? m';
  return `±${accuracy.toFixed(0)} m`;
}
