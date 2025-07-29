import { Expose, Transform } from "class-transformer";
import { AfterConstruct } from "../../core/utils/class-transformer";
import { UUIDTypes } from "uuid";

// Domain Entities
export class Category implements AfterConstruct {
  @Expose()
  id!: UUIDTypes;

  @Expose()
  name!: string;

  @Expose()
  description!: string;

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

export class CategoryWithLastUsed extends Category {
  @Expose()
  @Transform(({ value }) => new Date(value))
  lastUsedAt!: Date;
}

export class CategoryWithLatestNote extends Category {
  @Expose()
  recentNotes!: Array<{
    content: string;
    updatedAt: Date;
  }>;

  @Expose()
  noteCount!: number;

  afterConstruct() {
    // Needed
  }
}

// Category Manager State
export interface CategoryManagerState {
  currentCategory: Category | null;
  isLoading: boolean;
  error: Error | null;
}

export interface CategorizationRequest {
  noteContent: string;
}

export interface NewCategorySuggestion {
  title: string;
  description: string;
}

export interface CategorizationResponse {
  orderedCategoryIds: UUIDTypes[];
  newCategory?: NewCategorySuggestion;
}
