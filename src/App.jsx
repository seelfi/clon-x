import { Routes, Route, Outlet, Navigate, Link } from "react-router-dom";

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
import { useAuth } from "./context/AuthContext";

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
  const { token } = useAuth();
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
      <Route element={token ? <Navigate to="/" replace /> : <Outlet />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Not found */}
      <Route
        path="*"
        element={
          <main className="profile-page">
            <h1>Página no encontrada</h1>
            <Link to="/" className="profile-back-link">
              Volver al inicio
            </Link>
          </main>
        }
      />
    </Routes>
  );
}

export default App;
