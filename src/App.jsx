import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import RightPanel from "./components/RightPanel";
import PrivateRoute from "./components/PrivateRoute";

import Publish from "./pages/Publish";
import Profile from "./pages/Profile";
import Following from "./pages/Following";
import Followers from "./pages/Followers";
import Login from "./pages/Login";
import Register from "./pages/Register";

import mockPosts from "./data/mockPosts";

import "./styles/App.css";

const initialFollowingByUser = {
  pablo_dev: [
    "ana_dev",
    "carlos_code",
    "laura_design",
    "mateo_tech",
    "sofia_web",
  ],
  ana_dev: ["pablo_dev", "carlos_code"],
  carlos_code: ["pablo_dev", "laura_design"],
  laura_design: ["pablo_dev", "ana_dev"],
  mateo_tech: ["pablo_dev", "carlos_code"],
  sofia_web: ["pablo_dev", "laura_design"],
  andres_dev: ["pablo_dev"],
  camila_codes: ["pablo_dev"],
  daniel_tech: ["pablo_dev"],
};

function MainLayout() {
  const [posts, setPosts] = useState(mockPosts);

  const [followingByUser, setFollowingByUser] = useState(
    initialFollowingByUser
  );

  const followingUsernames = followingByUser.pablo_dev || [];

  function setFollowingUsernames(updater) {
    setFollowingByUser((current) => {
      const currentUsernames = current.pablo_dev || [];

      const nextUsernames =
        typeof updater === "function"
          ? updater(currentUsernames)
          : updater;

      return {
        ...current,
        pablo_dev: nextUsernames,
      };
    });
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Outlet
          context={{
            posts,
            setPosts,
            followingUsernames,
            setFollowingUsernames,
            followingByUser,
            setFollowingByUser,
          }}
        />
      </main>

      <RightPanel
        posts={posts}
        followingUsernames={followingUsernames}
        setFollowingUsernames={setFollowingUsernames}
      />
    </div>
  );
}

function Home() {
  return <Feed />;
}

function App() {
  return (
    <Routes>
      {/* Private routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/publish" element={<Publish />} />

          <Route
            path="/users/:username"
            element={<Profile />}
          />

          <Route
            path="/users/:username/following"
            element={<Following />}
          />

          <Route
            path="/users/:username/followers"
            element={<Followers />}
          />
        </Route>
      </Route>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Not found */}
      <Route
        path="*"
        element={
          <main>
            <h1>Página no encontrada</h1>
          </main>
        }
      />
    </Routes>
  );
}

export default App;