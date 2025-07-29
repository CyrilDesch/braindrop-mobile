import { Expose, Transform } from "class-transformer";
import { AfterConstruct } from "../../core/utils/class-transformer";

// Domain Entities
export class Note implements AfterConstruct {
  @Expose()
  id!: string;

  @Expose()
  content!: string;

  @Expose()
  categoryId!: string;

  @Expose()
  @Transform(({ value }) => new Date(value))
  createdAt!: Date;

  @Expose()
  @Transform(({ value }) => new Date(value))
  updatedAt!: Date;

  @Expose()
  @Transform(({ value }) => (value ? new Date(value) : null))
  deletedAt!: Date | null;

  @Expose()
  dirty!: number;

  afterConstruct() {
    // Needed
  }
}

export class NoteWithCategory extends Note {
  @Expose()
  categoryName!: string;

  @Expose()
  categoryDescription!: string;
}

// Note Manager State
export interface NoteManagerState {
  currentNote: Note | null;
  isLoading: boolean;
  error: Error | null;
}

export interface CreateNoteRequest {
  content: string;
  categoryId: string;
}

export interface UpdateNoteRequest {
  content?: string;
  categoryId?: string;
}
