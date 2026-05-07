import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { WelcomePage } from "./pages/WelcomePage";
import { PublicLayout } from "./pages/PublicLayout";
import { ResetPassword } from "./pages/ResetPassword";
import { Goals } from "./components/goals/Goals";
import FoldersPage from "./components/pages-y-folder/FoldersPage";
import { SoundList } from "./pages/API-externa/Freesound";
import { ProfilePage } from "./pages/ProfilePage";
import { AboutPage } from "./pages/AboutPage";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<WelcomePage />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
        <Route path="/home" element={<Home />} />
        <Route path="/single/:theId" element={<Single />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/folders" element={<FoldersPage />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/music" element={<SoundList />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </>
  )
);