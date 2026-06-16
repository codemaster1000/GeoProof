// Location hook — GPS coordinates + reverse geocoding
// FR-007 to FR-011

import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { reverseGeocode, formatCoordinates, formatAccuracy } from '../utils/geocoding';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address: string | null;
  coordinateString: string;
  accuracyString: string;
  timestamp: Date;
  isLoading: boolean;
  hasPermission: boolean | null;
}

export function useLocation(): LocationData {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const geocodingRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }
      setHasPermission(true);

      // Get an immediate fix
      try {
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!cancelled) {
          setLocation(initial);
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }

      // Start watching for continuous updates
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          if (!cancelled) setLocation(loc);
        }
      );
    }

    start();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
    };
  }, []);

  // Trigger reverse geocoding when location updates
  useEffect(() => {
    if (!location || geocodingRef.current) return;

    async function doGeocode() {
      if (!location) return;
      geocodingRef.current = true;
      try {
        const result = await reverseGeocode(location.coords.latitude, location.coords.longitude);
        setAddress(result?.formatted ?? null);
      } finally {
        geocodingRef.current = false;
      }
    }

    doGeocode();
  }, [location?.coords.latitude, location?.coords.longitude]);

  const latitude = location?.coords.latitude ?? 0;
  const longitude = location?.coords.longitude ?? 0;
  const accuracy = location?.coords.accuracy ?? null;

  return {
    latitude,
    longitude,
    accuracy,
    address,
    coordinateString: formatCoordinates(latitude, longitude),
    accuracyString: formatAccuracy(accuracy),
    timestamp: location ? new Date(location.timestamp) : new Date(),
    isLoading,
    hasPermission,
  };
}
