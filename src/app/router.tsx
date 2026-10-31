import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "../components/layout/SiteLayout";
import { HomePage } from "../pages/HomePage";
import { WorkPage } from "../pages/WorkPage";
import { ProjectPage } from "../pages/ProjectPage";
import { NotesPage } from "../pages/NotesPage";
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
      {
        path: "notes/:slug",
        lazy: async () => ({ Component: (await import("../pages/NotePage")).NotePage }),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
