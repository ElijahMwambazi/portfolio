import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "../components/layout/SiteLayout";
import { HomePage } from "../pages/HomePage";
import { WorkPage } from "../pages/WorkPage";
import { ProjectPage } from "../pages/ProjectPage";
import { NotesPage } from "../pages/NotesPage";
import { NotePage } from "../pages/NotePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "work", element: <WorkPage /> },
      { path: "work/:slug", element: <ProjectPage /> },
      { path: "notes", element: <NotesPage /> },
      { path: "notes/:slug", element: <NotePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
