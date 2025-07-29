import { useMutation, useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";
import Toast from "react-native-toast-message";
import { Category } from "src/features/category/types";
import { capturePrettyException } from "src/core/sentry/config";
import { queryClient } from "src/core/api/queryClient";
import { useCategorizeNote as originalUseCategorizeNote } from "./useCategorizeNote";

export function useCategoryManager() {
  const getCategories = () =>
    useQuery({
      queryKey: ["categories"],
      queryFn: () =>
        categoryService.getAllCategories().catch((error) => {
          capturePrettyException("Error fetching categories", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred while fetching categories",
          });
          throw error;
        }),
    });

  const getCategoriesWithLatestNote = () =>
    useQuery({
      queryKey: ["categories", "with-latest-note"],
      queryFn: () =>
        categoryService.getCategoriesWithLatestNote().catch((error) => {
          capturePrettyException(
            "Error fetching categories with latest note",
            error,
          );
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred while fetching categories",
          });
          throw error;
        }),
    });

  const useCategorizeNote = originalUseCategorizeNote({});

  const createCategory = useMutation({
    mutationFn: (
      categoryData: Omit<
        Category,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
        | "dirty"
        | "afterConstruct"
      >,
    ) => categoryService.createCategory(categoryData),
    onSuccess: () => {
      // Invalidate both category queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories", "with-latest-note"],
      });
      Toast.show({
        type: "success",
        text1: "Category created successfully",
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: "error",
        text1: "Error creating category",
        text2: error.message,
      });
    },
  });

  return {
    getCategories,
    getCategoriesWithLatestNote,
    createCategory,
    useCategorizeNote,
  };
}
