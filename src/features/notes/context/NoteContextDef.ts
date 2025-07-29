import { createContext } from "react";
import { useNoteManager } from "../hooks/useNoteManager";

// Define the context type
export type NoteContextType = ReturnType<typeof useNoteManager>;

// Create context with default undefined value
export const NoteContext = createContext<NoteContextType | undefined>(
  undefined,
);
