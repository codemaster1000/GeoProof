import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Projects Table ───────────────────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  clientName: text('client_name'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── Photos Table ─────────────────────────────────────────────────────────────
export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  stampedUri: text('stamped_uri').notNull(),
  cleanUri: text('clean_uri').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  accuracy: real('accuracy'),
  address: text('address'),
  notes: text('notes'),
  capturedAt: text('captured_at').notNull(),
  overlayStyle: integer('overlay_style').notNull().default(1),
  overlayPosition: text('overlay_position').notNull().default('BR'),
  showDate: integer('show_date', { mode: 'boolean' }).notNull().default(true),
  showTime: integer('show_time', { mode: 'boolean' }).notNull().default(true),
  showLatitude: integer('show_latitude', { mode: 'boolean' }).notNull().default(true),
  showLongitude: integer('show_longitude', { mode: 'boolean' }).notNull().default(true),
  showAccuracy: integer('show_accuracy', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  project: one(projects, {
    fields: [photos.projectId],
    references: [projects.id],
  }),
}));

// ─── TypeScript Types ─────────────────────────────────────────────────────────
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
