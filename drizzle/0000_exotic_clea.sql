CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`stamped_uri` text NOT NULL,
	`clean_uri` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`accuracy` real,
	`address` text,
	`notes` text,
	`captured_at` text NOT NULL,
	`overlay_style` integer DEFAULT 1 NOT NULL,
	`overlay_position` text DEFAULT 'BR' NOT NULL,
	`show_date` integer DEFAULT true NOT NULL,
	`show_time` integer DEFAULT true NOT NULL,
	`show_latitude` integer DEFAULT true NOT NULL,
	`show_longitude` integer DEFAULT true NOT NULL,
	`show_accuracy` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`client_name` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
