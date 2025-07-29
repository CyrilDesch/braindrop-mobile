import { createContext } from "react";
import { useCategoryManager } from "../hooks/useCategoryManager";

// Define the context type
export type CategoryContextType = ReturnType<typeof useCategoryManager>;

// Create context with default undefined value
export const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);
