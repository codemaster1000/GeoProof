// Create / Edit Project Modal
// FR-016: Create projects with Name, Client Name (optional), Description (optional)
// FR-017: Edit project metadata

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { Project } from '../db/schema';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; clientName?: string; description?: string }) => Promise<void>;
  editProject?: Project | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  onSave,
  editProject,
}) => {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate fields when editing
  useEffect(() => {
    if (editProject) {
      setName(editProject.name);
      setClientName(editProject.clientName ?? '');
      setDescription(editProject.description ?? '');
    } else {
      setName('');
      setClientName('');
      setDescription('');
    }
    setError('');
  }, [editProject, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        clientName: clientName.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch {
      setError('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{editProject ? 'Edit Project' : 'New Project'}</Text>
          <Text style={styles.subtitle}>
            {editProject ? 'Update project details' : 'Create a new field documentation project'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Project Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Site Inspection — Block 7"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
                accessibilityLabel="Project name input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Client Name <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                value={clientName}
                onChangeText={setClientName}
                placeholder="e.g. Apex Constructions Ltd."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
                accessibilityLabel="Client name input"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of this project..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Project description input"
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} accessibilityLabel="Cancel">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                accessibilityLabel="Save project"
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveText}>{editProject ? 'Update' : 'Create Project'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
    paddingTop: Spacing.md,
    maxHeight: '85%',
    ...Shadow.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography['2xl'],
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optional: {
    color: Colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Radius.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    fontSize: Typography.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  textArea: {
    height: 80,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.sm,
    marginBottom: Spacing.base,
    fontFamily: Typography.fontMedium,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  cancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
    fontSize: Typography.base,
  },
  saveBtn: {
    flex: 2,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    ...Shadow.accent,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: Colors.textOnAccent,
    fontFamily: Typography.fontSemiBold,
    fontSize: Typography.base,
  },
});
