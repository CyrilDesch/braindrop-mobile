import React, { ReactNode } from "react";
import { useCategoryManager } from "../hooks/useCategoryManager";
import { useCategoryEmbeddings } from "../hooks/useCategoryEmbeddings";
import { CategoryContext } from "./CategoryContextDef";

// Provider component
export const CategoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const categoryManager = useCategoryManager();

  useCategoryEmbeddings();

  return (
    <CategoryContext.Provider value={categoryManager}>
      {children}
    </CategoryContext.Provider>
  );
};
