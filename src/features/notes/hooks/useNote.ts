import { useContext } from "react";
import { NoteContext, NoteContextType } from "../context/NoteContextDef";

// Hook to use the note context
export function useNote(): NoteContextType {
  const context = useContext(NoteContext);

  if (context === undefined) {
    throw new Error("useNote must be used within a NoteProvider");
  }

  return context;
}
