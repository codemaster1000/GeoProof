// Photo Detail Screen — FR-021: Attach notes to individual photos
// Shows full photo, metadata, and note editing

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { photos as photosTable, Photo } from '../db/schema';
import { WatermarkOverlay } from '../components/WatermarkOverlay';
import { formatCoordinates, formatAccuracy } from '../utils/geocoding';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { WATERMARK_STYLES } from '../constants/watermarkStyles';
import { WatermarkStyleId, WatermarkPosition } from '../constants/watermarkStyles';
import { deleteFile } from '../utils/fileStorage';

interface PhotoDetailScreenProps {
  navigation: any;
  route: { params: { photoId: number; projectId: number; projectName: string } };
}

export default function PhotoDetailScreen({ navigation, route }: PhotoDetailScreenProps) {
  const { photoId, projectId, projectName } = route.params;
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhoto();
  }, [photoId]);

  const loadPhoto = async () => {
    const [result] = await db.select().from(photosTable).where(eq(photosTable.id, photoId));
    if (result) {
      setPhoto(result);
      setNotes(result.notes ?? '');
    }
    setIsLoading(false);
  };

  const handleSaveNotes = async () => {
    if (!photo) return;
    setIsSaving(true);
    try {
      await db.update(photosTable).set({ notes: notes.trim() || null }).where(eq(photosTable.id, photoId));
      Alert.alert('✅ Notes Saved', 'Notes updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save notes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo?',
      'This will permanently delete this photo and all associated files.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!photo) return;
            setIsDeleting(true);
            try {
              await db.delete(photosTable).where(eq(photosTable.id, photoId));
              await deleteFile(photo.stampedUri);
              if (photo.cleanUri !== photo.stampedUri) {
                await deleteFile(photo.cleanUri);
              }
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete photo.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !photo) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const coords = formatCoordinates(photo.latitude, photo.longitude);
  const acc = formatAccuracy(photo.accuracy);
  const captureTime = format(new Date(photo.capturedAt), 'EEEE, dd MMMM yyyy · HH:mm:ss');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{projectName}</Text>
          <TouchableOpacity
            style={[styles.deleteBtn, isDeleting && { opacity: 0.5 }]}
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityLabel="Delete photo"
          >
            {isDeleting ? <ActivityIndicator size="small" color={Colors.danger} /> : <Text style={styles.deleteIcon}>🗑️</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Photo with overlay preview */}
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: photo.cleanUri }}
              style={styles.photo}
              resizeMode="cover"
            />
            <WatermarkOverlay
              styleId={photo.overlayStyle as WatermarkStyleId}
              position={photo.overlayPosition as WatermarkPosition}
              fields={{
                showDate: photo.showDate,
                showTime: photo.showTime,
                showLatitude: photo.showLatitude,
                showLongitude: photo.showLongitude,
                showAccuracy: photo.showAccuracy,
              }}
              latitude={photo.latitude}
              longitude={photo.longitude}
              accuracy={photo.accuracy}
              address={photo.address}
              timestamp={new Date(photo.capturedAt)}
              projectName={projectName}
            />
          </View>

          {/* Metadata */}
          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>📍 Location & Time</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>CAPTURED</Text>
              <Text style={styles.metaValue}>{captureTime}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>COORDINATES</Text>
              <Text style={styles.metaValue}>{coords}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>ACCURACY</Text>
              <Text style={styles.metaValue}>{acc}</Text>
            </View>
            {photo.address && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ADDRESS</Text>
                <Text style={styles.metaValue}>{photo.address}</Text>
              </View>
            )}
          </View>

          {/* Notes (FR-021) */}
          <View style={styles.notesCard}>
            <Text style={styles.metaTitle}>📝 Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this photo… (location details, work completed, conditions, etc.)"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              accessibilityLabel="Photo notes input"
            />
            <TouchableOpacity
              style={[styles.saveNotesBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSaveNotes}
              disabled={isSaving}
              accessibilityLabel="Save notes"
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.saveNotesBtnText}>Save Notes</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: Colors.accent,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  photo: {
    ...StyleSheet.absoluteFill,
  },
  metaCard: {
    margin: Spacing.base,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  metaTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    gap: Spacing.md,
  },
  metaLabel: {
    width: 90,
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingTop: 2,
  },
  metaValue: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    lineHeight: 20,
  },
  notesCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    fontSize: Typography.base,
    padding: Spacing.md,
    minHeight: 120,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  saveNotesBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.accent,
  },
  saveNotesBtnText: {
    color: Colors.textOnAccent,
    fontFamily: Typography.fontSemiBold,
    fontSize: Typography.base,
  },
});
