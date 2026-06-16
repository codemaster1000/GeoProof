// Project Detail Screen — FR-019, FR-020, FR-021
// Photo grid view with search and note editing

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useProjectPhotos } from '../hooks/useProjects';
import { PhotoGrid } from '../components/PhotoGrid';
import { Photo } from '../db/schema';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

interface ProjectDetailScreenProps {
  navigation: any;
  route: { params: { projectId: number; projectName: string } };
}

export default function ProjectDetailScreen({ navigation, route }: ProjectDetailScreenProps) {
  const { projectId, projectName } = route.params;
  const { photos, isLoading, searchPhotos, refresh } = useProjectPhotos(projectId);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredPhotos = searchQuery ? searchPhotos(searchQuery) : photos;

  const handlePhotoPress = (photo: Photo) => {
    navigation.navigate('PhotoDetail', { photoId: photo.id, projectId, projectName });
  };

  const handleCameraPress = () => {
    navigation.navigate('Camera', { projectId, projectName });
  };

  const handleReportPress = () => {
    navigation.navigate('Report', { projectId, projectName });
  };

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statNum}>{photos.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statNum}>{photos.filter(p => p.notes).length}</Text>
          <Text style={styles.statLabel}>Notes</Text>
        </View>
        <TouchableOpacity style={styles.reportBtn} onPress={handleReportPress}>
          <Text style={styles.reportBtnText}>📄 Generate Report</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar (FR-020) */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by notes or location…"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search photos"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {searchQuery ? (
        <Text style={styles.searchResultText}>
          {filteredPhotos.length} result{filteredPhotos.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
      ) : null}
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyState}>
      {isLoading ? (
        <Text style={styles.emptyText}>Loading photos…</Text>
      ) : searchQuery ? (
        <>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No photos match "{searchQuery}"</Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptyText}>Open the camera tab and select this project to start documenting.</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{projectName}</Text>
          <Text style={styles.headerSub}>{photos.length} photos</Text>
        </View>
        <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraPress} accessibilityLabel="Open camera">
          <Text style={styles.cameraBtnIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      <PhotoGrid
        photos={filteredPhotos}
        onPhotoPress={handlePhotoPress}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    fontFamily: Typography.fontRegular,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontMedium,
  },
  cameraBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  cameraBtnIcon: {
    fontSize: 18,
  },
  listHeader: {
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  statChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minWidth: 60,
  },
  statNum: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
  },
  reportBtnText: {
    color: Colors.accent,
    fontFamily: Typography.fontSemiBold,
    fontSize: Typography.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    fontSize: Typography.base,
    padding: 0,
  },
  clearBtn: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    padding: 4,
  },
  searchResultText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
    marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
