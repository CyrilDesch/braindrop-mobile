CREATE TABLE `category_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`embedding` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
