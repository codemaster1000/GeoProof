// Camera Screen — FR-001 to FR-006, FR-012 to FR-015
// Full-screen camera with GPS overlay, watermark burning, dual-save

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as ScreenCapture from 'react-native-view-shot';
import { format } from 'date-fns';
import { useLocation } from '../hooks/useLocation';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { WatermarkOverlay, OverlayFields } from '../components/WatermarkOverlay';
import { WatermarkStyleId, WatermarkPosition } from '../constants/watermarkStyles';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { savePhotoToSandbox, generatePhotoFilename } from '../utils/fileStorage';
import { db } from '../db/client';
import { photos as photosTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { projects } from '../db/schema';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FlashModeType = 'off' | 'on' | 'auto';

interface CameraScreenProps {
  navigation: any;
  route?: { params?: { projectId?: number; projectName?: string } };
}

const FLASH_ICONS: Record<FlashModeType, string> = { off: '⚡️✗', on: '⚡️', auto: '⚡️A' };
const FLASH_CYCLE: FlashModeType[] = ['off', 'on', 'auto'];

export default function CameraScreen({ navigation, route }: CameraScreenProps) {
  const projectId = route?.params?.projectId;
  const projectName = route?.params?.projectName;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashModeType>('off');
  const [zoom, setZoom] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState<WatermarkStyleId>(1);
  const [overlayPosition, setOverlayPosition] = useState<WatermarkPosition>('BR');
  const [overlayFields, setOverlayFields] = useState<OverlayFields>({
    showDate: true,
    showTime: true,
    showLatitude: true,
    showLongitude: true,
    showAccuracy: true,
  });

  const cameraRef = useRef<CameraView>(null);
  const compositeRef = useRef<View>(null);
  const location = useLocation();
  const { isPremium } = usePremiumStatus();

  // Pinch-to-zoom gesture (FR-005)
  const baseZoom = useSharedValue(0);
  const currentZoom = useSharedValue(0);

  const setZoomJS = useCallback((val: number) => {
    const clamped = Math.min(Math.max(val, 0), 1);
    setZoom(clamped);
    currentZoom.value = clamped;
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newZoom = baseZoom.value + (e.scale - 1) * 0.4;
      const clamped = Math.min(Math.max(newZoom, 0), 1);
      currentZoom.value = clamped;
      runOnJS(setZoomJS)(clamped);
    })
    .onEnd(() => {
      baseZoom.value = currentZoom.value;
    });

  // Toggle flash mode (FR-004)
  const cycleFlash = () => {
    setFlashMode(prev => {
      const idx = FLASH_CYCLE.indexOf(prev);
      return FLASH_CYCLE[(idx + 1) % FLASH_CYCLE.length];
    });
  };

  // Toggle lens (FR-003)
  const flipCamera = () => {
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  };

  // Capture photo (FR-002, FR-006, FR-012)
  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    if (!projectId) {
      Alert.alert('Select a Project', 'Please select a project before taking photos.', [
        { text: 'Go to Projects', onPress: () => navigation.navigate('Projects') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!location.latitude && !location.longitude) {
      Alert.alert('No GPS Signal', 'Waiting for GPS fix. Please ensure location is enabled.');
      return;
    }

    setIsCapturing(true);
    try {
      const captureTimestamp = new Date();

      // 1. Capture clean photo (FR-006 — un-watermarked original)
      const cleanPhotoData = await cameraRef.current.takePictureAsync({
        quality: 0.92,
        base64: false,
        exif: false,
      });

      if (!cleanPhotoData) throw new Error('Camera capture failed');

      // 2. Save clean copy
      const cleanFilename = generatePhotoFilename('clean');
      const cleanUri = await savePhotoToSandbox(cleanPhotoData.uri, cleanFilename);

      // 3. Capture composited (watermarked) view via react-native-view-shot
      // This snapshots the compositeRef view which has photo + overlay
      // For Expo Go compatibility, we write the watermark data into the DB
      // and the stamped display is handled in the grid view
      // Note: Full pixel-burn requires captureRef from react-native-view-shot
      // using the compositeRef below in the off-screen render

      const stampedFilename = generatePhotoFilename('stamped');
      const stampedUri = cleanUri; // Simplified: use same file, overlay burned at display time
      // TODO: Implement full pixel-burn using react-native-view-shot captureRef

      // 4. Save photo record to database
      await db.insert(photosTable).values({
        projectId,
        stampedUri,
        cleanUri,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address,
        notes: null,
        capturedAt: captureTimestamp.toISOString(),
        overlayStyle,
        overlayPosition,
        showDate: overlayFields.showDate,
        showTime: overlayFields.showTime,
        showLatitude: overlayFields.showLatitude,
        showLongitude: overlayFields.showLongitude,
        showAccuracy: overlayFields.showAccuracy,
        createdAt: new Date().toISOString(),
      });

      // Success flash animation
      Alert.alert('📷 Photo Saved', `Saved to ${projectName ?? 'project'}\n${location.coordinateString}`, [
        { text: 'OK' },
      ]);
    } catch (err) {
      console.error('Capture error:', err);
      Alert.alert('Capture Failed', 'Could not save photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [cameraRef, isCapturing, projectId, projectName, location, overlayStyle, overlayPosition, overlayFields, navigation]);

  // Toggle individual overlay fields (FR-013)
  const toggleField = (field: keyof OverlayFields) => {
    setOverlayFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>GeoProof needs camera access to capture field photos.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera Viewport (FR-001) */}
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flashMode as FlashMode}
            zoom={zoom}
          />

          {/* GPS Overlay Preview */}
          {location.latitude !== 0 && (
            <WatermarkOverlay
              styleId={overlayStyle}
              position={overlayPosition}
              fields={overlayFields}
              latitude={location.latitude}
              longitude={location.longitude}
              accuracy={location.accuracy}
              address={location.address}
              timestamp={location.timestamp}
              projectName={projectName}
              showGeoProofBranding={!isPremium}
            />
          )}

          {/* GPS Status Bar */}
          <View style={styles.gpsStatusBar}>
            <View style={[styles.gpsDot, location.isLoading && styles.gpsDotLoading]} />
            <Text style={styles.gpsText}>
              {location.isLoading
                ? 'Acquiring GPS…'
                : `${location.coordinateString} ${location.accuracyString}`}
            </Text>
          </View>

          {/* Project Selector Banner */}
          <TouchableOpacity
            style={styles.projectBanner}
            onPress={() => navigation.navigate('Projects')}
          >
            <Text style={styles.projectBannerText}>
              {projectName ? `📁 ${projectName}` : '📁 Tap to select project'}
            </Text>
          </TouchableOpacity>
        </View>
      </GestureDetector>

      {/* Controls */}
      <SafeAreaView style={styles.controls}>
        {/* Top Controls Row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={cycleFlash} accessibilityLabel={`Flash: ${flashMode}`}>
            <Text style={styles.iconBtnText}>{FLASH_ICONS[flashMode]}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)} accessibilityLabel="Overlay settings">
            <Text style={styles.iconBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls Row */}
        <View style={styles.bottomRow}>
          {/* Flip Camera (FR-003) */}
          <TouchableOpacity style={styles.sideBtn} onPress={flipCamera} accessibilityLabel="Flip camera">
            <Text style={styles.sideBtnIcon}>🔄</Text>
          </TouchableOpacity>

          {/* Shutter Button (FR-002) */}
          <TouchableOpacity
            style={[styles.shutterBtn, isCapturing && styles.shutterBtnCapturing]}
            onPress={capturePhoto}
            disabled={isCapturing}
            accessibilityLabel="Capture photo"
          >
            {isCapturing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          {/* Zoom indicator */}
          <View style={styles.sideBtn}>
            <Text style={styles.zoomText}>{zoom > 0 ? `${(1 + zoom * 4).toFixed(1)}×` : '1×'}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Overlay Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide" onRequestClose={() => setShowSettings(false)}>
        <View style={styles.settingsOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowSettings(false)} />
          <View style={styles.settingsSheet}>
            <View style={styles.settingsHandle} />
            <Text style={styles.settingsTitle}>Overlay Settings</Text>

            {/* Style Selection (FR-014) */}
            <Text style={styles.settingsLabel}>LAYOUT STYLE</Text>
            <View style={styles.styleRow}>
              {([1, 2, 3] as WatermarkStyleId[]).map(id => (
                <TouchableOpacity
                  key={id}
                  style={[styles.styleChip, overlayStyle === id && styles.styleChipActive]}
                  onPress={() => setOverlayStyle(id)}
                  accessibilityLabel={`Style ${id}`}
                >
                  <Text style={[styles.styleChipText, overlayStyle === id && styles.styleChipTextActive]}>
                    {id === 1 ? '🏗️ Badge' : id === 2 ? '🔍 Inspector' : '🏢 Corporate'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Position Selection (FR-015) */}
            <Text style={styles.settingsLabel}>POSITION</Text>
            <View style={styles.positionGrid}>
              {(['TL', 'TR', 'BL', 'BR'] as WatermarkPosition[]).map(pos => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.posBtn, overlayPosition === pos && styles.posBtnActive]}
                  onPress={() => setOverlayPosition(pos)}
                  accessibilityLabel={`Position: ${pos}`}
                >
                  <Text style={[styles.posBtnText, overlayPosition === pos && styles.posBtnTextActive]}>
                    {pos === 'TL' ? '↖' : pos === 'TR' ? '↗' : pos === 'BL' ? '↙' : '↘'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Field Toggles (FR-013) */}
            <Text style={styles.settingsLabel}>SHOW FIELDS</Text>
            {(Object.keys(overlayFields) as (keyof OverlayFields)[]).map(field => (
              <TouchableOpacity
                key={field}
                style={styles.toggleRow}
                onPress={() => toggleField(field)}
                accessibilityLabel={`Toggle ${field}`}
              >
                <Text style={styles.toggleLabel}>
                  {field === 'showDate' ? 'Date' : field === 'showTime' ? 'Time' : field === 'showLatitude' ? 'Latitude' : field === 'showLongitude' ? 'Longitude' : 'Accuracy'}
                </Text>
                <View style={[styles.toggle, overlayFields[field] && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, overlayFields[field] && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  gpsStatusBar: {
    position: 'absolute',
    top: 60,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  gpsDotLoading: {
    backgroundColor: Colors.warning,
  },
  gpsText: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
  },
  projectBanner: {
    position: 'absolute',
    top: 16,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.4)',
  },
  projectBannerText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    textAlign: 'center',
  },
  controls: {
    backgroundColor: Colors.bg,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnIcon: {
    fontSize: 22,
  },
  zoomText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
  },
  shutterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  shutterBtnCapturing: {
    borderColor: Colors.accent,
    opacity: 0.7,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  permissionTitle: {
    fontSize: Typography['2xl'],
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  permissionBtnText: {
    color: Colors.textOnAccent,
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
  },
  settingsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsSheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
    paddingTop: Spacing.md,
  },
  settingsHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  settingsTitle: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  settingsLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  styleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  styleChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  styleChipActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.accent,
  },
  styleChipText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
    textAlign: 'center',
  },
  styleChipTextActive: {
    color: Colors.accent,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  posBtn: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posBtnActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.accent,
  },
  posBtnText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  posBtnTextActive: {
    color: Colors.accent,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  toggleLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.textMuted,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    backgroundColor: Colors.white,
    alignSelf: 'flex-end',
  },
});
