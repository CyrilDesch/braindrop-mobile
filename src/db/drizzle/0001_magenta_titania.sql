PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`dirty` integer NOT NULL,
	CONSTRAINT "description_max_length" CHECK(length("__new_categories"."description") <= 200),
	CONSTRAINT "name_max_length" CHECK(length("__new_categories"."name") <= 64)
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "description", "created_at", "updated_at", "deleted_at", "dirty") SELECT "id", "name", "description", "created_at", "updated_at", "deleted_at", "dirty" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`category_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`dirty` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "content_max_length" CHECK(length("__new_notes"."content") <= 10000)
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "content", "category_id", "created_at", "updated_at", "deleted_at", "dirty") SELECT "id", "content", "category_id", "created_at", "updated_at", "deleted_at", "dirty" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;