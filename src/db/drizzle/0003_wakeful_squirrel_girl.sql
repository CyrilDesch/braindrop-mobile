CREATE TABLE `note_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`note_id` text NOT NULL,
	`embedding` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action
);
