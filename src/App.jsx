
import { Routes, Route, Outlet } from 'react-router-dom'
import { useState } from 'react'

import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import RightPanel from './components/RightPanel'

import Publish from './pages/Publish'
import Profile from './pages/Profile'
import Following from './pages/Following'
import Followers from './pages/Followers'
import Login from './pages/Login'
import Register from './pages/Register'

import mockPosts from './data/mockPosts'

import './styles/App.css'

function MainLayout() {
  const [posts, setPosts] = useState(mockPosts)

  const [followingUsernames, setFollowingUsernames] = useState([
    'ana_dev',
    'carlos_code',
    'laura_design',
    'mateo_tech',
    'sofia_web'
  ])

  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Outlet
          context={{
            posts,
            setPosts,
            followingUsernames,
            setFollowingUsernames
          }}
        />
      </main>

      <RightPanel />
    </div>
  )
}

function Home() {
  return <Feed />
}

function App() {
  return (
    <Routes>
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

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="*"
        element={
          <main>
            <h1>Página no encontrada</h1>
          </main>
        }
      />
    </Routes>
  )
}

export default App
