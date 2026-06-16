// Projects Screen — FR-016, FR-017, FR-018 + Tier 1 Ad Banner
// Dashboard for managing field documentation projects

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useProjects } from '../hooks/useProjects';
import { useProjectPhotos } from '../hooks/useProjects';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AdBanner } from '../components/AdBanner';
import { PremiumPassButton } from '../components/PremiumPassButton';
import { Project } from '../db/schema';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

// Sub-component to show photo count per project
const ProjectCardWithCount = ({
  project,
  onPress,
  onLongPress,
}: {
  project: Project;
  onPress: () => void;
  onLongPress: () => void;
}) => {
  const { photos } = useProjectPhotos(project.id);
  return (
    <ProjectCard
      project={project}
      photoCount={photos.length}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};

interface ProjectsScreenProps {
  navigation: any;
}

export default function ProjectsScreen({ navigation }: ProjectsScreenProps) {
  const { projects, isLoading, createProject, updateProject, deleteProject, refresh } = useProjects();
  const { isPremium, isLifetimePro } = usePremiumStatus();
  const [modalVisible, setModalVisible] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleOpenProject = (project: Project) => {
    navigation.navigate('ProjectDetail', { projectId: project.id, projectName: project.name });
  };

  const handleLongPress = (project: Project) => {
    Alert.alert(
      project.name,
      'What would you like to do?',
      [
        {
          text: '✏️ Edit Project',
          onPress: () => {
            setEditProject(project);
            setModalVisible(true);
          },
        },
        {
          text: '🗑️ Delete Project',
          style: 'destructive',
          onPress: () => confirmDelete(project),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = (project: Project) => {
    Alert.alert(
      'Delete Project?',
      `This will permanently delete "${project.name}" and ALL associated photos. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
            } catch {
              Alert.alert('Error', 'Failed to delete project. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSave = async (data: { name: string; clientName?: string; description?: string }) => {
    if (editProject) {
      await updateProject(editProject.id, data);
    } else {
      await createProject(data);
    }
    setEditProject(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GeoProof</Text>
          <Text style={styles.headerSubtitle}>Field Documentation</Text>
        </View>
        <TouchableOpacity
          style={styles.newProjectBtn}
          onPress={() => { setEditProject(null); setModalVisible(true); }}
          accessibilityLabel="Create new project"
        >
          <Text style={styles.newProjectIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Pass Button */}
        <PremiumPassButton style={styles.premiumBtn} />

        {/* Quick Stats */}
        {projects.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{projects.length}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.success }]}>
              <Text style={[styles.statNum, { color: Colors.success }]}>✓</Text>
              <Text style={styles.statLabel}>Offline</Text>
            </View>
          </View>
        )}

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Projects</Text>
          <Text style={styles.sectionHint}>Long press to edit or delete</Text>
        </View>

        {/* Projects List */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyText}>Loading projects…</Text>
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyText}>Create your first project to start documenting field work with GPS-tagged photos.</Text>
            <TouchableOpacity
              style={styles.createFirstBtn}
              onPress={() => { setEditProject(null); setModalVisible(true); }}
            >
              <Text style={styles.createFirstText}>Create First Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map(project => (
            <ProjectCardWithCount
              key={project.id}
              project={project}
              onPress={() => handleOpenProject(project)}
              onLongPress={() => handleLongPress(project)}
            />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Free Tier Ad Banner (Tier 1) */}
      <AdBanner isVisible={!isPremium} />

      {/* Create / Edit Project Modal */}
      <CreateProjectModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditProject(null); }}
        onSave={handleSave}
        editProject={editProject}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontMedium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  newProjectBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  newProjectIcon: {
    color: Colors.textOnAccent,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: Typography.fontRegular,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  premiumBtn: {
    marginBottom: Spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statNum: {
    fontSize: Typography['2xl'],
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontRegular,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 64,
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
    marginBottom: Spacing.xl,
  },
  createFirstBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  createFirstText: {
    color: Colors.textOnAccent,
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
  },
});
