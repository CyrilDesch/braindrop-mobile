import { useContext } from "react";
import {
  CategoryContext,
  CategoryContextType,
} from "../context/CategoryContextDef";

// Hook to use the category context
export function useCategory(): CategoryContextType {
  const context = useContext(CategoryContext);

  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }

  return context;
}
