// ProjectCard Component
// Displays a project in the dashboard list with metadata and stats

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Project } from '../db/schema';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

interface ProjectCardProps {
  project: Project;
  photoCount: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  photoCount,
  onPress,
  onLongPress,
}) => {
  const initial = project.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      accessibilityLabel={`Project: ${project.name}, ${photoCount} photos`}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{initial}</Text>
        <View style={styles.iconDot} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        {project.clientName ? (
          <Text style={styles.client} numberOfLines={1}>👤 {project.clientName}</Text>
        ) : null}
        {project.description ? (
          <Text style={styles.description} numberOfLines={1}>{project.description}</Text>
        ) : null}
        <View style={styles.meta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>📷 {photoCount} photo{photoCount !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.date}>{format(new Date(project.createdAt), 'dd MMM yyyy')}</Text>
        </View>
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  iconDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surfaceElevated,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  client: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  description: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  metaText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  date: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textMuted,
  },
});
