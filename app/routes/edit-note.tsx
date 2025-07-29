import React from "react";
import CreateNoteModal from "./create-note";

// This is a wrapper that passes the noteId to create-note modal
// The create-note modal handles both creation and editing based on the presence of noteId
export default function EditNoteModal() {
  return <CreateNoteModal />;
}
