// Projects CRUD hook using Drizzle ORM + expo-sqlite
// FR-016 to FR-021

import { useState, useEffect, useCallback } from 'react';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { projects, photos, Project, NewProject, Photo } from '../db/schema';
import { deleteProjectPhotos } from '../utils/fileStorage';

export function useProjects() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
      setProjectList(result);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(async (data: Omit<NewProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const now = new Date().toISOString();
    const [created] = await db.insert(projects).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    await loadProjects();
    return created;
  }, [loadProjects]);

  const updateProject = useCallback(async (id: number, data: Partial<Pick<Project, 'name' | 'clientName' | 'description'>>): Promise<void> => {
    await db.update(projects).set({
      ...data,
      updatedAt: new Date().toISOString(),
    }).where(eq(projects.id, id));
    await loadProjects();
  }, [loadProjects]);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    // Get photo file paths before deleting
    const photoRecords = await db.select().from(photos).where(eq(photos.projectId, id));
    const filePaths = photoRecords.flatMap(p => [p.stampedUri, p.cleanUri]);

    // Delete DB records (cascade deletes photos)
    await db.delete(projects).where(eq(projects.id, id));

    // Delete physical files
    await deleteProjectPhotos(filePaths);

    await loadProjects();
  }, [loadProjects]);

  return {
    projects: projectList,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    refresh: loadProjects,
  };
}

export function useProjectPhotos(projectId: number) {
  const [photoList, setPhotoList] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPhotos = useCallback(async () => {
    try {
      const result = await db.select().from(photos)
        .where(eq(photos.projectId, projectId))
        .orderBy(desc(photos.capturedAt));
      setPhotoList(result);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const addPhoto = useCallback(async (data: Omit<Photo, 'id' | 'createdAt'>): Promise<Photo> => {
    const now = new Date().toISOString();
    const [created] = await db.insert(photos).values({
      ...data,
      createdAt: now,
    }).returning();
    await loadPhotos();
    return created;
  }, [loadPhotos]);

  const updatePhotoNotes = useCallback(async (photoId: number, notes: string): Promise<void> => {
    await db.update(photos).set({ notes }).where(eq(photos.id, photoId));
    await loadPhotos();
  }, [loadPhotos]);

  const deletePhoto = useCallback(async (photoId: number, stampedUri: string, cleanUri: string): Promise<void> => {
    await db.delete(photos).where(eq(photos.id, photoId));
    await deleteProjectPhotos([stampedUri, cleanUri]);
    await loadPhotos();
  }, [loadPhotos]);

  const searchPhotos = useCallback((query: string): Photo[] => {
    if (!query.trim()) return photoList;
    const q = query.toLowerCase();
    return photoList.filter(p =>
      p.notes?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  }, [photoList]);

  return {
    photos: photoList,
    isLoading,
    addPhoto,
    updatePhotoNotes,
    deletePhoto,
    searchPhotos,
    refresh: loadPhotos,
  };
}
