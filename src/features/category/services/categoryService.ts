import {
  Category,
  CategoryWithLastUsed,
  NewCategorySuggestion,
  CategoryWithLatestNote,
} from "../types";
import { capturePrettyException } from "../../../core/sentry/config";
import { CategoryRepo } from "src/db/repos";
import { CategoryEmbeddingRepo } from "src/db/repos/categoryRepo";
import { embeddingService } from "src/features/embedding/services/embeddingService";
import { transformToClass } from "src/core/utils/class-transformer";
import { apiClient } from "src/core/api/client";
import { getDeviceId } from "src/core/utils/deviceId";

export const categoryService = {
  /**
   * Get all categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const categories = await CategoryRepo.list();
      return categories.map((category: any) =>
        transformToClass(Category, category),
      );
    } catch (error) {
      capturePrettyException("Error getting all categories", error);
      throw error;
    }
  },

  /**
   * Get categories with last used date
   */
  getCategoriesWithLastUsed: async (): Promise<CategoryWithLastUsed[]> => {
    try {
      const categories = await CategoryRepo.listWithLastUsed();
      return categories.map((category: any) =>
        transformToClass(CategoryWithLastUsed, category),
      );
    } catch (error) {
      capturePrettyException("Error getting categories with last used", error);
      throw error;
    }
  },

  /**
   * Get categories with their latest note content
   */
  getCategoriesWithLatestNote: async (): Promise<CategoryWithLatestNote[]> => {
    try {
      const categories = await CategoryRepo.listWithLatestNote();
      return categories.map((category: any) => {
        const transformed = transformToClass(CategoryWithLatestNote, category);
        // Ensure recentNotes is always an array
        if (
          !transformed.recentNotes ||
          !Array.isArray(transformed.recentNotes)
        ) {
          transformed.recentNotes = [];
        }
        // Ensure noteCount is always a number
        if (typeof transformed.noteCount !== "number") {
          transformed.noteCount = 0;
        }
        return transformed;
      });
    } catch (error) {
      capturePrettyException(
        "Error getting categories with latest note",
        error,
      );
      throw error;
    }
  },

  createCategory: async (
    category: Omit<
      Category,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "dirty"
      | "afterConstruct"
    >,
  ): Promise<Category> => {
    try {
      const newCategory = await CategoryRepo.create({
        name: category.name,
        description: category.description,
      });
      // Générer et stocker les embeddings pour la catégorie
      const text = `${category.name} ${category.description}`;
      await embeddingService.initialise();
      const embeddings = await embeddingService.generateEmbedding(
        text,
        "passage",
      );
      await CategoryEmbeddingRepo.insertMany(
        newCategory.id,
        embeddings.map((e) => e.embedding),
      );
      return transformToClass(Category, newCategory);
    } catch (error) {
      capturePrettyException("Error creating category", error);
      throw error;
    }
  },

  categorizeNote: async (
    noteContent: string,
  ): Promise<NewCategorySuggestion> => {
    try {
      const deviceId = await getDeviceId();
      const apiKey = process.env.EXPO_PUBLIC_API_KEY;

      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const { data } = await apiClient.post<NewCategorySuggestion>(
        "/categories/categorize",
        { noteContent },
        {
          headers: {
            "X-API-Key": apiKey,
            "X-Device-Id": deviceId,
          },
        },
      );

      return data;
    } catch (error) {
      capturePrettyException("Error calling categorize API", error);
      throw error;
    }
  },
};
