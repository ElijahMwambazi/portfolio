import rawNotes from "virtual:notes";
import { createNotesStore } from "./createStore";

// The build-time plugin strips drafts from `rawNotes` in production; the
// flag below only controls local preview in `vite dev`.
export const notesStore = createNotesStore(rawNotes, {
  includeDrafts: import.meta.env.DEV,
});
