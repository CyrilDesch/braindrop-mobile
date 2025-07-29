import { router } from "expo-router";
import { FABAction } from "./types";
import FileTextIcon from "../../../../assets/icons/file-text.svg";
import TagIcon from "../../../../assets/icons/tag.svg";

// Helper function to create actions for different pages
export const createHomeActions = (): FABAction[] => [
  {
    id: "create-note",
    title: "New Note",
    icon: FileTextIcon,
    onPress: () => router.push("/routes/create-note"),
    color: "#007AFF",
  },
  {
    id: "create-category",
    title: "New Category",
    icon: TagIcon,
    onPress: () => router.push("/routes/create-category"),
    color: "#34C759",
  },
];

export const createNotesActions = (): FABAction[] => [
  {
    id: "create-note",
    title: "New Note",
    icon: FileTextIcon,
    onPress: () => router.push("/routes/create-note"),
    color: "#007AFF",
  },
  {
    id: "create-category",
    title: "New Category",
    icon: TagIcon,
    onPress: () => router.push("/routes/create-category"),
    color: "#34C759",
  },
];
