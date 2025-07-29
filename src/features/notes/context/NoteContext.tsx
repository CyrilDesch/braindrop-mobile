import React, { ReactNode } from "react";
import { useNoteManager } from "../hooks/useNoteManager";
import { NoteContext } from "./NoteContextDef";

// Provider component
export const NoteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const noteManager = useNoteManager();

  return (
    <NoteContext.Provider value={noteManager}>{children}</NoteContext.Provider>
  );
};
