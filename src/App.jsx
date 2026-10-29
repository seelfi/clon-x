import { Routes, Route, Outlet } from "react-router-dom";

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

import "./styles/App.css";

function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>

      <RightPanel />
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
