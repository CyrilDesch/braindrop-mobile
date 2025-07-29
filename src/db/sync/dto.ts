// Origin local
export interface CategoryResponseDto {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteResponseDto {
  id: string;
  content: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResponseDto {
  until: string;
  createdCategories: CategoryResponseDto[];
  updatedCategories: CategoryResponseDto[];
  deletedCategories: string[];

  createdNotes: NoteResponseDto[];
  updatedNotes: NoteResponseDto[];
  deletedNotes: string[];
}

// Origin Server
export interface CreateUpdateCategoryDto {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUpdateNoteDto {
  id: string;
  content: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncDto {
  since: string;
  categoriesToCreate: CreateUpdateCategoryDto[];
  categoriesToUpdate: CreateUpdateCategoryDto[];
  categoriesToDelete: string[];

  notesToCreate: CreateUpdateNoteDto[];
  notesToUpdate: CreateUpdateNoteDto[];
  notesToDelete: string[];
}
