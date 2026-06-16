// Report Screen — FR-022, FR-023, FR-024
// On-device PDF and CSV report generation with Android share sheet

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { projects, photos as photosTable, Project, Photo } from '../db/schema';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { generatePdfReport } from '../utils/pdfGenerator';
import { exportCsv } from '../utils/csvExporter';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

interface ReportScreenProps {
  navigation: any;
  route: { params: { projectId: number; projectName: string } };
}

type ReportStatus = 'idle' | 'generating-pdf' | 'generating-csv' | 'sharing' | 'done' | 'error';

export default function ReportScreen({ navigation, route }: ReportScreenProps) {
  const { projectId, projectName } = route.params;
  const { isPremium } = usePremiumStatus();
  const [project, setProject] = useState<Project | null>(null);
  const [photoList, setPhotoList] = useState<Photo[]>([]);
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    const [proj] = await db.select().from(projects).where(eq(projects.id, projectId));
    const pics = await db.select().from(photosTable)
      .where(eq(photosTable.projectId, projectId))
      .orderBy(desc(photosTable.capturedAt));
    setProject(proj ?? null);
    setPhotoList(pics);
    setIsLoading(false);
  };

  const handleGeneratePdf = async () => {
    if (!project) return;

    // Premium gate for CSV — PDF is always available (FR-022)
    if (!isPremium && photoList.length > 20) {
      Alert.alert(
        'Unlock Premium',
        'Free tier supports PDF reports up to 20 photos. Activate a 24-hour pass or upgrade to Lifetime Pro for unlimited reports.',
        [{ text: 'OK' }]
      );
      return;
    }

    setStatus('generating-pdf');
    setStatusMessage('Compiling PDF report…');

    try {
      const pdfUri = await generatePdfReport({
        project,
        photos: photoList,
        isPremium,
      });

      setStatus('sharing');
      setStatusMessage('Opening share sheet…');

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `${project.name} — GeoProof Report`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sharing Unavailable', `Report saved to: ${pdfUri}`);
      }

      setStatus('done');
      setStatusMessage('Report shared successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      setStatus('error');
      setStatusMessage('Failed to generate PDF. Please try again.');
    }
  };

  const handleGenerateCsv = async () => {
    if (!project) return;

    if (!isPremium) {
      Alert.alert(
        '🔒 Premium Feature',
        'CSV export requires a 24-hour Premium Pass or Lifetime Pro upgrade.',
        [
          { text: 'Get 24-Hour Pass', onPress: () => navigation.navigate('Projects') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setStatus('generating-csv');
    setStatusMessage('Building CSV spreadsheet…');

    try {
      const csvUri = await exportCsv(project, photoList);

      setStatus('sharing');
      setStatusMessage('Opening share sheet…');

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(csvUri, {
          mimeType: 'text/csv',
          dialogTitle: `${project.name} — GeoProof Data`,
        });
      } else {
        Alert.alert('Sharing Unavailable', `CSV saved to: ${csvUri}`);
      }

      setStatus('done');
      setStatusMessage('CSV exported successfully!');
    } catch (err) {
      console.error('CSV export error:', err);
      setStatus('error');
      setStatusMessage('Failed to export CSV. Please try again.');
    }
  };

  const isWorking = status === 'generating-pdf' || status === 'generating-csv' || status === 'sharing';

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Report</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Project Summary */}
        <View style={styles.projectSummary}>
          <Text style={styles.summaryTitle}>{projectName}</Text>
          {project?.clientName && <Text style={styles.summaryMeta}>👤 {project.clientName}</Text>}
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNum}>{photoList.length}</Text>
              <Text style={styles.summaryStatLabel}>Photos</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNum}>{photoList.filter(p => p.notes).length}</Text>
              <Text style={styles.summaryStatLabel}>Notes</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNum}>{photoList.filter(p => p.address).length}</Text>
              <Text style={styles.summaryStatLabel}>Geocoded</Text>
            </View>
          </View>
        </View>

        {/* Status Message */}
        {(status !== 'idle') && (
          <View style={[styles.statusBanner, status === 'error' && styles.statusError, status === 'done' && styles.statusDone]}>
            {isWorking && <ActivityIndicator color={Colors.textOnAccent} size="small" style={{ marginRight: 8 }} />}
            <Text style={[styles.statusText, (status === 'error' || status === 'done') && styles.statusTextLight]}>{statusMessage}</Text>
          </View>
        )}

        {/* PDF Report */}
        <View style={styles.reportCard}>
          <View style={styles.reportCardHeader}>
            <Text style={styles.reportCardIcon}>📄</Text>
            <View style={styles.reportCardMeta}>
              <Text style={styles.reportCardTitle}>PDF Field Report</Text>
              <Text style={styles.reportCardDesc}>
                Professional report with photo grid, timestamps, GPS coordinates, and notes
              </Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: Colors.accentGlow, borderColor: Colors.accent }]}>
              <Text style={[styles.tierBadgeText, { color: Colors.accent }]}>FREE</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.generateBtn, isWorking && styles.generateBtnDisabled]}
            onPress={handleGeneratePdf}
            disabled={isWorking || photoList.length === 0}
            accessibilityLabel="Generate PDF report"
          >
            {status === 'generating-pdf' ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.generateBtnText}>Generate & Share PDF</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CSV Export */}
        <View style={styles.reportCard}>
          <View style={styles.reportCardHeader}>
            <Text style={styles.reportCardIcon}>📊</Text>
            <View style={styles.reportCardMeta}>
              <Text style={styles.reportCardTitle}>CSV Spreadsheet</Text>
              <Text style={styles.reportCardDesc}>
                All photo metadata in a structured spreadsheet (Excel/Google Sheets compatible)
              </Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: Colors.goldGlow, borderColor: Colors.gold }]}>
              <Text style={[styles.tierBadgeText, { color: Colors.gold }]}>PRO</Text>
            </View>
          </View>
          {!isPremium && (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockedText}>🔒 Requires 24-Hour Pass or Lifetime Pro</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.generateBtn, styles.generateBtnCsv, isWorking && styles.generateBtnDisabled]}
            onPress={handleGenerateCsv}
            disabled={isWorking || photoList.length === 0}
            accessibilityLabel="Export CSV spreadsheet"
          >
            {status === 'generating-csv' ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.generateBtnTextLight}>Export CSV Data</Text>
            )}
          </TouchableOpacity>
        </View>

        {photoList.length === 0 && (
          <View style={styles.noPhotosNote}>
            <Text style={styles.noPhotosText}>⚠️ No photos in this project. Add photos before generating reports.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.accent },
  headerTitle: { fontSize: Typography.lg, fontFamily: Typography.fontBold, color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, gap: Spacing.base },
  projectSummary: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  summaryTitle: { fontSize: Typography.xl, fontFamily: Typography.fontBold, color: Colors.textPrimary, marginBottom: 4 },
  summaryMeta: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  summaryStats: { flexDirection: 'row', gap: Spacing.base },
  summaryStatItem: { alignItems: 'center' },
  summaryStatNum: { fontSize: Typography['2xl'], fontFamily: Typography.fontBold, color: Colors.accent },
  summaryStatLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontFamily: Typography.fontMedium, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  statusError: { backgroundColor: Colors.danger },
  statusDone: { backgroundColor: Colors.success },
  statusText: { color: Colors.textOnAccent, fontFamily: Typography.fontMedium, fontSize: Typography.sm, flex: 1 },
  statusTextLight: { color: Colors.white },
  reportCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadow.sm,
  },
  reportCardHeader: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.base, alignItems: 'flex-start' },
  reportCardIcon: { fontSize: 32 },
  reportCardMeta: { flex: 1 },
  reportCardTitle: { fontSize: Typography.base, fontFamily: Typography.fontSemiBold, color: Colors.textPrimary, marginBottom: 2 },
  reportCardDesc: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 16 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, alignSelf: 'flex-start' },
  tierBadgeText: { fontSize: 9, fontFamily: Typography.fontBold, letterSpacing: 1 },
  lockedOverlay: { backgroundColor: Colors.goldGlow, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.gold },
  lockedText: { color: Colors.gold, fontFamily: Typography.fontMedium, fontSize: Typography.sm },
  generateBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.accent,
  },
  generateBtnCsv: { backgroundColor: Colors.success },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { color: Colors.textOnAccent, fontFamily: Typography.fontSemiBold, fontSize: Typography.base },
  generateBtnTextLight: { color: Colors.white, fontFamily: Typography.fontSemiBold, fontSize: Typography.base },
  noPhotosNote: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning },
  noPhotosText: { color: Colors.warning, fontFamily: Typography.fontMedium, fontSize: Typography.sm },
});
